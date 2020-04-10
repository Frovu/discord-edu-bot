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
        // check if admin
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const g = groups.findGroup(args[2]);
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[2]}\``); // not found
        if(groups.obj[g].elders.hasOwnProperty(target.id))
            return await message.reply(`\`${target.user.tag}\` уже староста \`${g}\`.`);
        // show preview and ask confirm
        if(!(await confirm(message.channel, message.author.id, `Сделать ${target} старостой \`${g}\`?`)))
            return;
        // give elder role
        target.roles.add(config.roles.elder).then().catch(()=>{log(`ERR`, `Failed to give elder role to ${target.user.tag}(${target.id})`)});
        groups.obj[g].elders.push(target.id);
        groups.jsonDump();
        //give role
        await target.roles.add(config.roles.elder);
        return await message.reply(`Список старост \`${g}\` успешно обновлен.`); // not found
    }
}
