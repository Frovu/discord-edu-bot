// remove one member from group list

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .add икбо-07-19 name
module.exports = {
    aliases: ["remove"],
    exec: async function(message) {
        const g = message.content.split(/\n| +/g)[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        const name = message.content.split(/\n| +/g).slice(2).join(' ');
        if(!groups.obj[g].members.hasOwnProperty(name))
            return await message.reply(`\`${name}\` не найден в списке \`${g}\`.`);
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id, `Удалить \`${name}\` из списка \`${g}\`?`)))
            return;
        delete groups.obj[g].members[name];
        groups.jsonDump();
        return await message.reply(`Список \`${g}\` успешно обновлен.`); // not found
    }
}
