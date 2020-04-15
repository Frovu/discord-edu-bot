const fs = require('fs');
const config = require('../json/config.json');

// relative to project root
const jsonPath = 'json/teachers.json';

// read or create empty object if not exist
try {
	var teachers = require('../' + jsonPath);
} catch(e) {
	log(`NOTE`, `Can't read ${jsonPath}. Count as empty.`)
	var teachers = new Object();
}
const numEmoji = ['0️⃣', '1️⃣',  '2️⃣', '3️⃣',  '4️⃣', '5️⃣',  '6️⃣', '7️⃣',  '8️⃣', '9️⃣', '🔟'];

module.exports.obj = teachers;

const jsonDump = () => fs.writeFileSync('./'+jsonPath, JSON.stringify(teachers, null, 2), 'utf8', (err) => {
    if(err) log(`ERROR`, `Failed writing ${jsonPath}`);
});
module.exports.jsonDump = jsonDump;

function find(namePart) {
    const found = Object.keys(teachers).filter(t => t===namePart || teachers[t].name.startsWith(namePart));
    if(found.length === 1)
        return found[0];
    return false;
}
async function chooseSubj(t, message) {
	if(teachers[t].subjects.length < 1) {
		await message.reply(`У преподавателя не указаны дисциплины, пожалуйста обратитесь к администратору.`);
		return false;
	}
	if(teachers[t].subjects.length === 1)
		return teachers[t].subjects[0];
	let i=0;
	const msg = await message.channel.send({embed: {title: `Выберите предмет:`,
		description: teachers[t].subjects.map(s => `**\`${++i}\`.** \`${s}\``).join('\n')}});

    const reactCollector = msg.createReactionCollector((r,u) => u.id === message.author.id, {time: 120000});
	const p = new Promise((resolve, reject) => {
		reactCollector.on('collect', async (r) => {
			const ans = numEmoji.indexOf(r.emoji.name)-1;
			if(ans >= 0 && ans < teachers[t].subjects.length) {
				resolve(teachers[t].subjects[ans]);
				reactCollector.stop();
			}
			if(r.emoji.name === '❌') {
				resolve(false);
				reactCollector.stop();
			}
		});
		reactCollector.on('end', (_, reason) => {resolve(false)})
	});
	for(let i=1; i<1+teachers[t].subjects.length; ++i)
		msg.react(numEmoji[i]);
	msg.react('❌');
	return p;
}

module.exports.find = find;
module.exports.chooseSubj = chooseSubj;
