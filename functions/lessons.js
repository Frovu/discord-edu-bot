const fs = require('fs');
const config = require('../json/config.json');
const teachers = require('./teachers.js');
const groups = require('./groups.js');

// relative to project root
const jsonPath = 'json/lessons.json';
let wrc = 0;
// read or create empty object if not exist
try {
	var lessons = require('../' + jsonPath);
} catch(e) {
	log(`ERROR`, `!!! Can't read ${jsonPath}. Count as empty.`)
	var lessons = {ongoing:{}, scheduled:{}};
}

module.exports.obj = lessons;

const jsonDump = () => fs.writeFileSync('./'+jsonPath, JSON.stringify(lessons, null, 2), 'utf8', (err) => {
    if(err) log(`ERROR`, `Failed writing ${jsonPath}`); wrc++;
});
module.exports.jsonDump = jsonDump;

function getChannelName(t, subj, time, lt, vc=false) {
    return `${lt}${vc?'.':''} ${subj} ${time.getHours()}${vc?':':'-'}${time.getMinutes()} ${teachers.obj[t].name.replace(/ ([А-Я])[а-яё]+/g, vc?' $1.':'-$1')}`;
}

// spawns lession (called from daemon or from command)
module.exports.spawn = async function (t, subj, time, type, gs, duration=7200000) {
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
        const embed = { title: `Пара: **${subj}** (**${type}**)`,
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
		lessons.ongoing[t] = {
			type: type,
			subj: subj,
			start: time,
			duration: duration,
			tc: tc.id,
			vc: vc.id,
			groups: gs,
			attended: {}
		}
		jsonDump();
		log(`NOTE`, `Lession spawned t:${t},gs:${gs} ${time.toISOString().replace(/\..+/, '')}`);
		return true;
    } catch(e) {
        log(`ERROR`, `!!! Failed to spawn lession of ${teachers.obj[t].name} for ${gs}:\n${e.stack}`);
        return false;
    }
}
