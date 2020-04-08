// get list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');

module.exports = {
    aliases: ["getlist", "list", "список"],
    exec: async function(message) {
        const g = message.content.split(/\n| +/g)[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        // parse list
        let list = ''; let u; let i=0;
        for(const m of Object.keys(groups.obj[g].members).sort()) {
            if(groups.obj[g].members[m])
                u = await message.guild.members.fetch(groups.obj[g].members[m]);
            else
                u = false;
            list+=`\`${++i}.\` \`${m}\`: ${u?u:'не найден'}${groups.obj[g].elders.includes(u.id)?' староста':''}\n`;
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
