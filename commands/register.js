// register group member

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js');
const resolve = require('../functions/resolveTarget.js');

// ex:
// .register <target> икбо-07-19 "na me"
module.exports = {
    aliases: ["register"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        const target = await resolve(message, args[1]);
        if(!target)
            return await message.reply(`Пользователь не найден.`); // not found
        const g = groups.findGroup(args[2]);
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[2]}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);

        const name = groups.find(g, args.slice(3).join(' '));
    	if(!name)
    		return await message.reply(`\`${name?name:'   '}\` не найден в списке группы \`${g}\`.`);
        // another user registered with this name
    	if(groups.obj[g].members[name] && groups.obj[g].members[name] !== message.member.id)
    		return await message.reply(`\`${name}\` уже зарегистрирован в группе \`${g}\`.`);
    	// search if user already in some group
    	for(const a in groups.obj)
    		if(Object.values(groups.obj[a].members).includes(target.id))
    			return await message.reply(`${target.user.tag} уже зарегистрирован в группе \`${a}\` под именем \`${Object.keys(groups.obj[a].members).find(m => groups.obj[a].members[m] === target.id)}\`.`);
        // ask confirmation
        if(!(await confirm(message.channel, message.author.id, `Вы хотите добавить \`${target.user.tag}\` в группу \`${g}\` как \`${name}\`.`)))
            return;
    	// all checks passed
    	await target.roles.add(groups.obj[g].role);
    	target.setNickname(name).then().catch(()=>{});
    	groups.obj[g].members[name] = target.id;
    	groups.jsonDump();
    	log(`NOTE`, `${message.member.user.tag} added ${target.user.tag}(${target.id}) to ${g} as ${name}`);
        await message.reply(`Успешно.`);
    }
}
