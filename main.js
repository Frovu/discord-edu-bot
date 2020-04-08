
const tokens = require('./tokens.json');
const Discord = require('discord.js');
// log for use in other modules too
log = require('./functions/logs.js');

const commands = require('./functions/cmds.js');
const groups = require('./functions/groups.js');

// unhandled rejection
process.on('unhandledRejection', (reason) => {
	log(`ERROR_UNHANDLED!`, reason.stack);
	client.users.fetch('236931374722973698').then(dm=>{dm.send(`\`\`\`\n${reason.stack}\`\`\``)});	// ping Frovy
});

// If start up went through correctly, inform about it.
log('BOT', `Starting edu bot.\n  Node version: ${process.version}\n  Discord.js version: ${Discord.version}`);

// Discord bot client. The bot itself.
const client = new Discord.Client({forceFetchUsers: true});
// Connection to Discord API.
client.login(tokens.discordbot);

// When the bot recieved connection.
client.on("ready", function () {
	log(`BOT`, `The bot is online!`);
	// set presence
	client.user.setActivity("distance learning", {type: "PLAYING"});
});

// Bot disconnection.
client.on("disconnect", function () {
	log(`BOT`, `Client disconnected.`);
});

client.on("error", async (err) => {
	log(`ERROR_EVENT`, `Client error: ${err}`);
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
