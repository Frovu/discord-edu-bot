// add one member to group list

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .add икбо-07-19 name
module.exports = {
    aliases: ["addmember"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const g = groups.findGroup(args[1]);
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[1]}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        const name = args.slice(2).join(' ');
        if(groups.obj[g].members.hasOwnProperty(name))
            return await message.reply(`\`${name}\` уже есть в списке.`);
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id, `Добавить \`${name}\` в \`${g}\`?`)))
            return;
        groups.obj[g].members[name] = null;
        groups.jsonDump();
        return await message.reply(`Список \`${g}\` успешно обновлен.`); // not found
    }
}
