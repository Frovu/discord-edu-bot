
const lessons = require('./lessons.js');
const groups = require('./groups.js');
const teachers = require('./teachers.js');
const config = require('../json/config.json');
const scheduled = lessons.obj.scheduled;

const margin = 20*60*1000; // 20 minutes
const spawnMargin = 5*60*1000; // 5 minutes
const weekVal = 7*24*60*60*1000;
const retryPeriod = 30000;
const safeMargin = 30*60*1000;

// timers mapped by teacher id
let toBeSpawned = {}

async function trySpawn(l, li) {
    const st = await lessons.spawn(l.teacher, l.subj, l.start, l.type, l.groups, l.duration);
    if(st) {
        // spawned successfuly, update schedule
        if(l.repeat === 'once')
            scheduled.splice(li, 1); // rm from schedule
        else if(l.repeat === 'weekly')
            l.start = new Date(l.start.valueOf()+weekVal);
        else if(l.repeat === 'weekly')
            l.start = new Date(l.start.valueOf()+weekVal*2);
        else
            log(`ERROR`, `Unknown repeat_type: ${l.repeat}`);
        delete toBeSpawned[l.teacher];
        lessons.jsonDump();
        return true;
    } else {
        log(`ERROR`, `Failed to spawn scheduled lesson ${l.subj} of ${l.teacher}.`);
        toBeSpawned[l.teacher] = setTimeout(()=>{trySpawn(l, li)}, retryPeriod);
    }
}

// create timeouts for spawning lessons that should start soon
module.exports.daemon = async function() {
    for(const li in scheduled) {
        const l = scheduled[li];
        // spawn lesson
        if(l.start.valueOf() - Date.now() < margin && !toBeSpawned.hasOwnProperty(l.teacher)) {
            toBeSpawned[l.teacher] = setTimeout(()=>{trySpawn(l, li)},  l.start.valueOf() - Date.now() - spawnMargin);
            log(`LESN`, `Lesson of ${teachers.obj[l.teacher].name} will spawn in ${(l.start.valueOf()-Date.now()-spawnMargin)/1000} sec.`);
            // notify groups and teacher
            let ch = client.guilds.resolve(config.guild).channels.resolve(teachers.obj[l.teacher].channel);
            await ch.send(`Ваша пара **${l.subj}**(${l.type}) для групп(ы) ${l.groups.map(g => g.toUpperCase()).join(', ')} начнется через ${((l.start.valueOf() - Date.now())/60000).toFixed(1)} минут.`);
            for(const ag of l.groups) {
                ch = client.guilds.resolve(config.guild).channels.resolve(groups.obj[ag].channel);
                await ch.send(`Ваша пара **${l.subj}**(${l.type}) с преподавателем \`${teachers.obj[l.teacher].name}\` начнется через ${((l.start.valueOf() - Date.now())/60000).toFixed(1)} минут.`);
            }
        }
    }
}

// add lesson to schedule
module.exports.add = async function(teacher, repeat, subj, time, type, groups, duration) {
    if(scheduled.find(al => al.teacher===teacher && Math.abs(al.time - time) < safeMargin)) {
        log(`WARN`, `Lesson already scheduled for ${teacher} around ${time.toISOString()}.`);
        return false;
    }
    scheduled.push({
        teacher: teacher,
        subj: subj,
        start: time,
        duration: duration,
        type: type,
        repeat: repeat,
        groups: groups
    });
    lessons.jsonDump();
    log(`LESN`, `Lesson scheduled of ${teacher} for ${groups} at ${time.toISOString()}`);
    exports.daemon(); // call daemon to check if new
    return true;
}
