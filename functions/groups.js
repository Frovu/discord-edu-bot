
const fs = require('fs');
const config = require('../json/config.json');

// relative to project root
const jsonPath = 'json/groups.json';

// read or create empty object if not exist
try {
	var groups = require('../' + jsonPath);
} catch(e) {
	log(`NOTE`, `Can't read ${jsonPath}. Count as empty.`)
	var groups = new Object();
}

module.exports.obj = groups;

const jsonDump = () => fs.writeFileSync('./'+jsonPath, JSON.stringify(groups, null, 2), 'utf8', (err) => {
    if(err) log(`ERROR`, `Failed writing ${jsonPath}`);
});
module.exports.jsonDump = jsonDump;

module.exports.onMessage = async function(message) {
	if(message.channel.id !== config.channels.entry)
		return;
	const args = message.content.split(/ +/g);
	const g = args[0].toLowerCase();
	if(!groups.hasOwnProperty(g))
		return await message.reply(`Группа не найдена: \`${g}\``);
	const name = args.slice(1).join(' ');
	if(!groups[g].members.hasOwnProperty(name))
		return await message.reply(`\`${name?name:'   '}\` не найден в списке группы \`${g}\`, пожалуйста, обратитесь к старосте своей группы, если все введено верно.`);
	if(groups[g].members[name] && groups[g].members[name] !== message.member.id)
		return await message.reply(`\`${name}\` уже зарегистрирован в группе \`${g}\`, пожалуйста, обратитесь к старосте своей группы, если это действительно вы.`);
	// search if user already in some group
	for(const g in groups)
		if(Object.values(groups[g].members).includes(message.member.id))
			return await message.reply(`Вы уже зарегистрированы в группе \`${g}\` под именем \`${Object.keys(groups[g].members).find(m => groups[g].members[m] === message.member.id)}\`, пожалуйста, обратитесь к старосте этой группы, если это какая-то ошибка.`);

	// all checks passed
	await message.member.roles.add(groups[g].role);
	await message.member.setNickname(name);
	groups[g].members[name] = message.member.id;
	jsonDump();
	// notify in group channel
	await message.guild.channels.resolve(groups[g].channel).send(`${message.member} присоединился, добро пожаловать!`);
}
