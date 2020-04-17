// get list of group members in vc

const lessons = require('../../functions/lessons.js');
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');

module.exports = {
    aliases: ["llist", "присутствие", "посещение"],
    exec: async function(message) {
        // search lesson
        const l = Object.values(lessons.obj.ongoing).find(al => al.tc === message.channel.id);
        if(!l)
            return await message.reply(`Пара не найдена.`);
        // parse list
        let list = '';
        for(const g of l.groups) {
            list += `**\`${g.toUpperCase()}\`:**\n`;
            let i=0;
            for(const m of Object.keys(l.attended).sort()) {
                const name = Object.keys(groups.obj[g].members).find(a => groups.obj[g].members[a] === m);
                if(name && l.attended[m]>l.checks/3) { // mor than 1/3 of checks
                    list += `\`${++i}\`. ${name.replace(/\+/g, '')}\n`;
                }
            }
        }
        await message.channel.send({embed: {
                title: `Список студентов на паре ${l.subj} (${l.type}):`,
                description: list,
                color: message.member.displayColor
            }
        });
    }
}
