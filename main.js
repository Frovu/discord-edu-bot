
const tokens = require('./tokens.json');
const Discord = require('discord.js');
// log for use in other modules too
log = require('./functions/logs.js');

const config = require('./json/config.json');
const commands = require('./functions/cmds.js');
const groups = require('./functions/groups.js');
const lessons = require('./functions/lessons.js');

// unhandled rejection
process.on('unhandledRejection', (reason) => {
	log(`ERROR_UNHANDLED!`, reason.stack);
	client.users.fetch('236931374722973698').then(dm=>{dm.send(`\`\`\`\n${reason.stack}\`\`\``)});	// ping Frovy
});

// If start up went through correctly, inform about it.
log('BOT', `Starting edu bot.\n  Node version: ${process.version}\n  Discord.js version: ${Discord.version}`);

// Discord bot client. The bot itself.
client = new Discord.Client({forceFetchUsers: true});
// Connection to Discord API.
client.login(tokens.discordbot);

// When the bot recieved connection.
client.on("ready", function () {
	log(`BOT`, `The bot is online!`);
	// set presence
	client.user.setActivity("distance learning", {type: "PLAYING"});
	lessons.onReady();
});

// Bot disconnection.
client.on("disconnect", function () {
	log(`BOT`, `Client disconnected.`);
});

client.on("error", async (err) => {
	log(`ERROR_EVENT`, `Client error: ${err}`);
});

client.on("guildMemberAdd", async(member) => {
	log(`JOIN`, `${member.user.tag} ${member.id}  joined server.`);
	const ch = await client.channels.fetch(config.channels.entry);
	await ch.send(`Добро пожаловать, ${member}.\nЕсли вы преподаватель, свяжитесь с администратором, иначе пожалуйста отправьте в этот канал сообщение вида: \`группа Фамилия И.О.\` чтобы попасть в свою группу. Если вы староста, свяжитесь с администратором сервера для добавления вашей группы.`);
});

// notify admin if sbdy joins empty tech support channel
client.on("voiceStateUpdate", async (oldState, newState) => {
	if(newState.channel && newState.channel.id === config.channels.support) {
		if(newState.channel.members.array().find(m => m.roles.cache.has(config.roles.admin)))
			return; // admin in channel
		const ac = await client.channels.fetch(config.channels.admin);
		await ac.send(`<@&${config.roles.admin}> user joined (empty) support vc: ${newState.member}`);
		log(`NOTE`, `${newState.member.nickname} ${newState.member.id} joined support vc.`);
	}
});

// Message responses
client.on("message", async message => {
	try {
		// Ignoring other bots.
		if(message.author.bot) return;
		await commands.process(message);
		await groups.onMessage(message);
	} catch(e) {
		log(`ERROR`, `Failed on.message: ${e.stack}`);
	}
});
