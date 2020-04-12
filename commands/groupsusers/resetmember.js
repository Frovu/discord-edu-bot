// reset member

const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');
const resolve = require('../../functions/resolveTarget.js');

module.exports = {
    aliases: ["reset"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const target = await resolve(message, args[1]);
        if(!target) {
            const g = groups.findGroup(args[1]);
            if(!g)
                return await message.reply(`Цель не найдена.`);
            const nm = groups.find(g, args.slice(2).join(' '));
            if(!message.member.roles.cache.has(config.roles.admin) || !nm)
                return await message.reply(`Цель не найдена в группе ${g}. (Или вы не администратор)`);
            groups.obj[g].members[nm] = null;
            groups.jsonDump();
            return await message.reply(`Успешно.`);
        }
        // search a group
        const g = Object.keys(groups.obj).find(k => Object.values(groups.obj[k].members).includes(target.id))
        if(!g)
            return await message.reply(`\`${target.user.tag}\` не состоит в группе.`); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        // ask confirm
        const name = Object.keys(groups.obj[g].members).find(k => groups.obj[g].members[k] === target.id);
        if(!(await confirm(message.channel, message.author.id, `Вы хотите выгнать ${target} (\`${name}\`) из группы \`${g}\`.`)))
            return;
        await target.roles.remove(groups.obj[g].role);
        groups.obj[g].members[name] = null;
        groups.jsonDump();
        // try to remove group role
        target.roles.remove(groups.obj[g].role).then().catch(()=>{});
        return await message.reply(`Успешно.`);
    }
}
