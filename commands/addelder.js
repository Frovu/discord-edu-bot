// add one member to group list

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js');
const resolve = require('../functions/resolveTarget.js');

// ex:
// .add икбо-07-19 name
module.exports = {
    aliases: ["addelder"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const target = await resolve(message, args[1]);
        if(!target)
            return await message.reply(`Target not found.`); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        if(args[2])
            var g = args[2].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        if(groups.obj[g].elders.hasOwnProperty(target.id))
            return await message.reply(`\`${target.user.tag}\` уже староста \`${g}\`.`);
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id, `Сделать ${target} старостой \`${g}\`?`)))
            return;
        groups.obj[g].elders.push(target.id);
        groups.jsonDump();
        //give role
        await target.roles.add(config.roles.elder);
        return await message.reply(`Список старост \`${g}\` успешно обновлен.`); // not found
    }
}
