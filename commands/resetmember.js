// reset member

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js');
const resolve = require('../functions/resolveTarget.js');

module.exports = {
    aliases: ["reset"],
    exec: async function(message) {
        const target = await resolve(message);
        // search a group
        const g = Object.keys(groups.obj).find(k => Object.values(groups.obj[k].members).includes(target.id))
        if(!g)
            return await message.reply(`\`${target.nickname}\` не состоит в группе.`); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        // ask confirm
        if(!(await confirm(message.channel, message.author.id, `Вы хотите выгнать ${target} из группы \`${g}\`.`)))
            return;
        groups.obj[g].members[Object.keys(groups.obj[g].members).find(k => groups.obj[g].members[k] === target.id)] = null;
        groups.jsonDump();
        // try to remove group role
        target.roles.remove(groups.obj[g].role).then().catch(()=>{});
        return await message.reply(`Успешно.`); // not found
    }
}
