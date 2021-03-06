// get list of group members

const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');

module.exports = {
    aliases: ["getlist", "list", "список"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const g = args[1]?groups.findGroup(args[1]):undefined;
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[1]}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin) && !message.member.roles.cache.has(config.roles.teacher))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        // parse list
        let list = ''; let u; let i=0;
        for(const m of Object.keys(groups.obj[g].members).sort()) {
            if(groups.obj[g].members[m]) {
                try{
                    u = await message.guild.members.fetch(groups.obj[g].members[m]);
                }catch(e){u=undefined; log(`WARN`, `${groups.obj[g].members[m]} aka ${m} from ${g} not found.`)}
            } else {
                u = false;
            }
            list+=`\`${++i}.\` \`${m.replace(/\+/g, '')}\`: ${u?u:'не найден'}${u&&groups.obj[g].elders.includes(u.id)?' староста':''}\n`;
        }
        await message.channel.send({embed: {
                title: `Список группы \`${g}\`:`,
                description: list,
                footer: {text: g},
                color: 3407864
            }
        });
    }
}
