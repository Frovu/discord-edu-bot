
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

// search for student by first word, otherwise search by startsWith(string)
// returns name from list (key)
function find(gr, namePart) {
	let found = Object.keys(groups[gr].members).filter(s => s.replace(/\+/g, '').split(' ')[0] === namePart.split(/ +/)[0]);
	// if found any
	if(found.length > 0) {
		if(found.length > 1) {
			// found several
			found = Object.keys(groups[gr].members).filter(s => s.replace(/\+/g, '').startsWith(namePart));
			if(found.length === 1)
				return found[0];
		} else
			return found[0];
	}
	return false;
}
// search for group ikbo-07 -> ikbo-07-19
function findGroup(namePart) {
	let found = Object.keys(groups).filter(s => s.startsWith(namePart.toLowerCase()));
	if(found.length === 1)
		return found[0];
	return false;
}
// convert name from list to user nickname
function getNick(name) {
	return name.includes('+') ? name.replace(/\+/g, '') : name.split(' ').slice(0, 2).join(' ');
}

module.exports.getNick = getNick;
module.exports.find = find;
module.exports.findGroup = findGroup;

module.exports.onMessage = async function(message) {
	if(message.channel.id !== config.channels.entry)
		return;
	// ignore admins / mods / elders
	if(message.member.roles.cache.has(config.roles.admin) || message.member.roles.cache.has(config.roles.moderator) || message.member.roles.cache.has(config.roles.elder))
		return;
	const args = message.content.split(/ +/g);
	const g = findGroup(args[0]);
	if(!g)
		return await message.reply(`Группа не найдена: \`${args[0]}\``);
	const name = find(args.slice(1).join(' '));
	if(!name)
		return await message.reply(`\`${args.slice(1).join(' ').concat(' ')}\` не найден в списке группы \`${g}\`, пожалуйста, обратитесь к старосте своей группы, если все введено верно.`);
	// if name already registered
	if(groups[g].members[name] && groups[g].members[name] !== message.member.id)
		return await message.reply(`\`${name}\` уже зарегистрирован в группе \`${g}\`, пожалуйста, обратитесь к старосте своей группы, если это действительно вы.`);
	// search if user already in some group
	for(const a in groups) {
		const foundName = Object.keys(groups[a].members).find(m => m !== name && groups[a].members[m] === message.member.id);
		if(foundName)
			return await message.reply(`Вы уже зарегистрированы в группе \`${a}\` под именем \`${foundName}\`, пожалуйста, обратитесь к старосте этой группы, если это какая-то ошибка.`);
	}
	// all checks passed
	await message.member.roles.add(groups[g].role);
	await message.member.roles.add(config.roles.student);
	await message.member.setNickname(getNick(name));
	groups[g].members[name] = message.member.id;
	jsonDump();
	log(`NOTE`, `${message.member.user.tag}(${message.member.id}) joined ${g} as ${name}`);
	// notify in group channel
	await message.guild.channels.resolve(groups[g].channel).send(`${message.member} присоединяется, добро пожаловать!`);
}
