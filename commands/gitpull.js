const child_process = require("child_process");

module.exports = {
	names: ["reload", "git pull"],
	exec: async function (message) {
        if(message.author.id !== '236931374722973698') return;
    	let child = child_process.spawn("git", ["pull"]);
    	let out = [];

    	child.stdout.on("data", data => out.push(data.toString()))
    	child.stderr.on("data", data => out.push(data.toString()))

    	let code = await {then: x => child.on("close", x)}
    	await message.author.send([
    		"`git pull` ",
    		`exited with code ${code}`,
    		"```",
    		out.join(""),
    		"```"
    		].join(""));
    	if (code) {
    		await message.reply("\\> git update unsuccessful");
    	} else {
    		await message.reply("\\> git update successful, process restarting...");
    		log('BOT', `> Git update requested by ${message.author.tag} done! Reloading..`);
    		process.exit(0);
    	}
    }
}
