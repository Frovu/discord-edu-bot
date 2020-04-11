const fs = require("fs");

// send last n lines
async function lastLog(logFiles, author, a=false) {
    let filename = logFiles[logFiles.length-2+a];
    let text = fs.readFileSync('./logs/'+filename).toString();
    if(text.split('\n').length < 50 && logFiles.length>2) {
        // read one more file
        filename = logFiles[logFiles.length-4+a];
        text = fs.readFileSync('./logs/'+filename)+'\n'+text;
    }
    text = '```'+text.split('\n').slice(-50).join('\n')+'```';
    await author.send(text, {split: {prepend:'```', append:'```'}});
}

module.exports = {
	aliases: ["log", "getlog"],
	exec: async function (message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        const logFiles = fs.readdirSync('./logs');
        if(!args[2]) {
            await lastLog(logFiles, message.author);
        } else switch(args[1]) {
            case 'list':
                let text = `\`\`\`\n${logFiles.join('\n')}\`\`\``;
                return await message.author.send(text, {split: {prepend:'```', append:'```'}});
            default:
                if(!logFiles.includes(args[2]))
                    return await message.reply(`\\> No subcommand named \`\`${args[1]}\`\``);
                await message.author.send(`\\> Requiring logging data...`, {
                  files: [{
                    attachment: `${process.cwd()}/logs/${args[1]}`,
                    name: args[1]
                  }]
                });
        }
    }
}
