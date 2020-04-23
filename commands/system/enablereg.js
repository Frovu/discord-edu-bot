const lessons = require('../../functions/lessons.js');
const config = require('../../json/config.json');

module.exports = {
    aliases: ["reg"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        if(!args[1])
            return await message.channel.send(`Regestration enabled = \`${lessons.obj.regEnable}\``);
        if(args[1]==='enable') {
            lessons.obj.regEnable = true;
        } else if(args[1]==='disable') {
            lessons.obj.regEnable = false;
        } else {
            return await message.channel.send(`Available options: \`enable/disable\``);
        }
        lessons.jsonDump();
        log(`NOTE`, `${message.author.tag} set regEnable to ${lessons.obj.regEnable}`);
        await message.channel.send(`set Regestration enabled = \`${lessons.obj.regEnable}\``);
    }
}
