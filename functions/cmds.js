// bot commands register and handle
const fs = require('fs')
const config = require('../json/config.json');
// great variable
let cmds = {};

// recursively import commands from ./commands
function importCommands(path) {
    try{
        fs.readdir(path, (err, files) => {
        	if(err)
                throw err;
            log(`CMDS`, `Importing dir: ${path}`);
            files.forEach(file => {
                if(!file.endsWith('.js')) // means its folder (lol)
                    return importCommands(path+'/'+file);
    			let imported = require('../'+path+'/'+file);
                for(const a of imported.aliases)
                    cmds[a] = imported;
        	});
        });
    } catch(e) {
        return log(`ERROR`, `Failed to import cmds from ${path.split('/')[-1]}:\n${e.stack}`);
    }
}
importCommands('commands');
setTimeout(()=>{log(`CMDS`, `Commands list: ${Object.keys(cmds)}`);}, 500);

// execute a command if needed (called from on.message event)
module.exports.process = async function (message) {
    if(message.author.bot) return false;
    if(message.content.indexOf(config.prefix) !== 0) return false;
    const command = message.content.slice(config.prefix.length).split(/\n|\r| +/g)[0].toLowerCase();
	try {
        // check if command exists
        if(!cmds.hasOwnProperty(command))
            return false; // command do not exist, ignore it

		// invoke command, pass message as arg
		await cmds[command].exec(message);
		return true;
	} catch(e) {
		log(`ERROR`, `Exception in .${command}: ${e.stack}`);
		return true;
	}
};
