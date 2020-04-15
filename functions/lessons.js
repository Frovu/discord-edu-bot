const fs = require('fs');
const config = require('../json/config.json');
const teachers = require('./teachers.js');
const groups = require('./groups.js');
const confirm = require('./reactConfirm.js');

// relative to project root
const jsonPath = 'json/lessons.json';
let wrc = 0;
// read or create empty object if not exist
try {
	var lessons = require('../' + jsonPath);
	// init dates
	for(const l in lessons.ongoing)
		lessons.ongoing[l].start = new Date(lessons.ongoing[l].start);
	for(const l of lessons.scheduled)
		l.start = new Date(l.start);
} catch(e) {
	log(`ERROR`, `!!! Can't read ${jsonPath}. Count as empty.`);
	var lessons = {ongoing:{}, scheduled:[]};
}
setInterval(()=>{log(`INFO`,`lessons.json was written ${wrc} times last hour`); wrc=0;}, 3600000);

module.exports.obj = lessons;
const schedulem = require('./schedule.js');
module.exports.schedule = schedulem.add;

function jsonDump() {
	fs.writeFileSync('./'+jsonPath, JSON.stringify(lessons, null, 2), 'utf8', (err) => {
	    if(err) log(`ERROR`, `Failed writing ${jsonPath}`);
		wrc++;
	});
}
module.exports.jsonDump = jsonDump;

function getChannelName(t, subj, time, lt, vc=false) {
    return `${lt}${vc?'.':''} ${subj} ${time.getHours()}${vc?':':'-'}${time.getMinutes()<10?'0':''}${time.getMinutes()} ${teachers.obj[t].name.replace(/ ([А-Я])[а-яё]+/g, vc?' $1.':'-$1')}`;
}

module.exports.onReady = async function() {
	// spawn schedule daemon
	client.setInterval(schedulem.daemon, config.lessons.daemonInterval);
	schedulem.daemon();
	// schedule attended check
	setTimeout(()=>{
		client.setInterval(checkAttended, config.lessons.checksInterval);
		checkAttended();
	}, 5000);
	// setup timers for lessons endings
	for(const l in lessons.ongoing) {
		const toEnd = lessons.ongoing[l].start.valueOf() + lessons.ongoing[l].duration - Date.now();
		if(toEnd > 0)
			client.setTimeout(()=>{exports.end(l, lessons.ongoing[l].tc, lessons.ongoing[l].teacher);}, toEnd);
		else
			exports.end(l, lessons.ongoing[l].tc, lessons.ongoing[l].teacher);
		log(`LESN`, `lesson ${l} will end in ${toEnd/1000} seconds`);
	}
}

// spawns lession (called from daemon or from command)
module.exports.spawn = async function (t, subj, time, type, gs, duration=5400000) {
    try {
		if(lessons.ongoing.hasOwnProperty(t)) {
			log(`NOTE`, `Lession already ongoing for ${t}`);
			return false;
		}
        const guild = client.guilds.resolve(config.guild);
        // to send info to teacher
        const tch = await guild.channels.resolve(teachers.obj[t].channel);
        // create channels
        let ows = [ {id: t, allow: 'VIEW_CHANNEL', type: 'member'},
            {id: guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'},
			{id: config.roles.moderator, allow: 'VIEW_CHANNEL', type: 'role'}
        ].concat(gs.map(g => {return {id: groups.obj[g].role, allow: 'VIEW_CHANNEL', type: 'role'};}));
        const tc = await guild.channels.create(getChannelName(t, subj, time, type), {
			parent: config.channels.lessons,
            topic: gs.map(g => g.toUpperCase()).join(', '),
            permissionOverwrites: ows
        });
		if(type === 'лк') // students cant speak on lecture
			ows.push({id: config.roles.student, deny: 'SPEAK', type: 'role'})
        const vc = await guild.channels.create(getChannelName(t, subj, time, type, true), {
			parent: config.channels.lessons,
            type: 'voice',
            topic: gs.map(g => g.toUpperCase()).join(', '),
            permissionOverwrites: ows
        });
        // send info messages
        const embed = { title: `Пара скоро начнется: **${subj}** (**${type}**)`,
            fields: [
                {name: 'Преподаватель', value: teachers.obj[t].name, inline: true},
                {name: 'Группы', value: gs.map(g => g.toUpperCase()).join(', '), inline: true},
                {name: 'Время начала', value: time.toString().replace(/:.. .+/, ''), inline: true},
                {name: 'Начнется через', value: `${Math.floor((time-Date.now())/60000)} минут`, inline: true}
            ],
            footer: teachers.obj[t].cathedra
        }

        await tch.send({embed: embed});
        const info = await tc.send(gs.map(g => `<@&${groups.obj[g].role}>`).join(' '), {embed: embed});
		// create actual entry
		lessons.ongoing[vc.id] = {
			teacher: t,
			type: type,
			subj: subj,
			start: time,
			duration: duration,
			tc: tc.id,
			groups: gs,
			checks: 0,
			attended: {}
		}
		jsonDump();
		client.setTimeout(()=>{exports.end(vc.id, tc.id, t);}, time.valueOf()+duration-Date.now());
		log(`NOTE`, `Lession spawned t:${t},gs:${gs} ${time.toISOString().replace(/\..+/, '')} ends in ${(time.valueOf()+duration-Date.now())/1000} sec`);
		return true;
    } catch(e) {
        log(`ERROR`, `!!! Failed to spawn lession of ${teachers.obj[t].name} for ${gs}:\n${e.stack}`);
        return false;
    }
};

// end lesson after confirmation
module.exports.end = async function(id, chId, authorId) {
	if(!lessons.ongoing.hasOwnProperty(id))
		return log(`NOTE`, `Lesson ${id} is already deleted.`);
	const guild = client.guilds.resolve(config.guild);
	const l = lessons.ongoing[id];
	if(!(await confirm(guild.channels.resolve(chId), authorId, `<@${authorId}>, Завершить пару **${l.subj}** (**${l.type}**)?`, 600000)))
		return log(`NOTE`, `Lesson ${id} did not end.`);
	let embed = {
		title: `**Пара завершена: ${l.subj} ${l.type}**`,
		description: 'Список присутствовавших:\n',
		fields: [
			{name: 'Преподаватель', value: teachers.obj[l.teacher].name, inline: true},
			{name: 'Группы', value: l.groups.map(g => g.toUpperCase()).join(', '), inline: true},
			{name: 'Время начала', value: l.start.toString().replace(/:.. .+/, ''), inline: true},
			{name: 'Продолжительность', value: `${Math.floor((Date.now()-l.start)/60000)} минут`, inline: true}
		],
		footer: teachers.obj[l.teacher].cathedra
	}
	for(const g of l.groups) {
		embed.description += `**\`${g.toUpperCase()}\`:**\n`;
		let i=0;
		for(const a in l.attended) {
			const m = Object.keys(groups.obj[g].members).find(k => groups.obj[g].members[k] === a);
			if(m)
				embed.description += `\`${++i}\`. ${m.replace(/\+/g, '')}\t-\t**${(l.attended[a]/l.checks*100).toFixed(1)}%**\n`;
			else
				log(`ERROR`, `on lesson end ${a} not found in ${g}`);
		}
	}
	// send this message to lesson and teachers channels
	await guild.channels.resolve(teachers.obj[l.teacher].channel).send({embed: embed});
	const tc = guild.channels.resolve(l.tc);
	const vc = guild.channels.resolve(id);
	await tc.send({embed: embed});
	log(`LESN`, `Lesson ${id} of ${teachers.obj[lessons.ongoing[id].teacher].name} ended.`);
	delete lessons.ongoing[id];
	jsonDump();
	// delete channels after timeout
	setTimeout(()=>{tc.delete()}, 600000); // 10 min
	setTimeout(()=>{vc.delete()}, 150000); // 2.5 min
}

// checks attended on all ongoing lessons
async function checkAttended() {
	for(const id in lessons.ongoing) {
		if(Date.now() < lessons.ongoing[id].start.valueOf() + config.lessons.checksIndent)
			continue;
		const vc = client.guilds.resolve(config.guild).channels.resolve(id);
		if(!vc) {
			log(`ERROR`, `Failed to resolve vc for lesson atdcheck ${id} of ${teachers.obj[lessons.ongoing[id].teacher].name}`);
			continue;
		}
		if(vc.members.has(lessons.ongoing[id].teacher)) {
			log(`ATCHK`, `No teacher on lesson ${id} (${teachers.obj[lessons.ongoing[id].teacher].name})`);
			continue;
		}
		let addd = 0; let incd = 0;
		for(const m of vc.members.array()) {
			if(m.voice.deaf) continue;
			if(!lessons.ongoing[id].attended.hasOwnProperty(m.id)) {
				let ok = false;
				for(const g of lessons.ongoing[id].groups) {
					if(Object.values(groups.obj[g].members).includes(m.id)) {
						ok = true;
						break;
					}
				}
				if(!ok) continue;
				lessons.ongoing[id].attended[m.id] = 1;
				addd++;
			}
			else {
				lessons.ongoing[id].attended[m.id]++;
				incd++;
			}
		}
		lessons.ongoing[id].checks++;
		log(`ATCHK`, `Check done in ${vc.name}. n=${lessons.ongoing[id].checks} new=${addd} inc=${incd}`);
	}
	jsonDump();
}
