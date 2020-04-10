// get list of group members in vc

const groups = require('../functions/groups.js');
const config = require('../json/config.json');

module.exports = {
    aliases: ["vclist", "присутствие", "наличие"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const g = groups.findGroup(args[1]);
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[1]}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin) && !message.member.roles.cache.has(config.roles.teacher))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        const vc = await message.guild.channels.cache.find(c => c.name.toLowerCase() === g && c.type === 'voice');
        if(!vc) return await message.reply(`vc not found.`);
        // parse list
        let list = []; let i=0;
        for(const m of vc.members.array()) {
            const name = Object.keys(groups.obj[g].members).find(a => groups.obj[g].members[a] === m.id);
            if(name) {
                list.push(name.replace(/\+/g, ''));
            }
        }
        await message.channel.send({embed: {
                title: `Список группы \`${g}\` (в канале):`,
                description: list.sort().map(e => {return `\`${++i}.\` ${e}`}).join('\n'),
                footer: {text: g},
                color: 8781774
            }
        });
    }
}
