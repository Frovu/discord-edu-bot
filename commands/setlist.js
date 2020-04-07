// set list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .setlist икбо-07-19\nMember1\nMember2
module.exports = {
    aliases: ["setlist"],
    exec: async function(message) {
        const g = message.content.split(/\n| +/g)[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        // parse list
        let members = {};
        for(const m of message.content.split('\n').slice(1)) {
            console.log(m)
            if(groups.obj[g].members[m]) // keep old users
                members[m] = groups.obj[g].members[m];
            else
                members[m] = null;
        }
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id,`\`\`\`json\n${JSON.stringify(members, null, 2)}\`\`\``)))
            return;
        groups.obj[g].members = members;
        groups.jsonDump();
        return await message.reply(`Список \`${g}\` успешно обновлен.`); // not found
    }
}
