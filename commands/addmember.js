// add one member to group list

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .add икбо-07-19 name
module.exports = {
    aliases: ["addmember"],
    exec: async function(message) {
        const g = message.content.split(/\n| +/g)[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        const name = message.content.split(/\n| +/g).slice(2).join(' ');
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id, `Добавить \`${name}\` в \`${g}\`?`)))
            return;
        groups.obj[g].members[name] = null;
        groups.jsonDump();
        return await message.reply(`Список \`${g}\` успешно обновлен.`); // not found
    }
}
