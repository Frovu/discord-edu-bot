/**
 * this module is the startup module for the rest of the bot
 *
 * it calls main.js as a child process
 * main.js is where the actual bot part begins
 *
 * this module is just so we can pull new code from git and restart the bot if needed
 *
 * if the child process dies for any reason, this module'll restart it
 */

const child_process = require("child_process")
const log = require('./functions/logs.js')

function setup_bot() {
	let bot = child_process.spawn("node", ["./main.js"])

	bot.stdout.on("data", data => process.stdout.write(data.toString()))
	bot.stderr.on("data", data => process.stderr.write(data.toString()))

	bot.on("close", code => {
		if (code) {
			// something went wrong
			log("BOOTLD", "The bot exited !!ungracefully!!, restarting...")
			// wait a bit to not spam logs and stuff since
			// chance of fixing problem with simple restart is very low
			setTimeout(setup_bot, 5000)
		} else {
			log("BOOTLD", "The bot exited gracefully, restarting...")
			setup_bot()
		}
	})

	return bot
}

setup_bot()
