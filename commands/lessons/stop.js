
const groups = require('../../functions/groups.js');
const lessons = require('../../functions/lessons.js');
const lsns = lessons.obj.ongoing;
const config = require('../../json/config.json');


// used by admin in any channel: .stop id
// used
module.exports = {
    aliases: ["stop", "end", "стоп", "конец"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        if(message.member.roles.cache.has(config.roles.teacher))
            var id = Object.keys(lsns).find(l => message.channel.id === lsns[l].tc && message.author.id === lsns[l].teacher);
        else if(args[1] && message.member.roles.cache.has(config.roles.admin)) {
            console.log(Object.keys(lsns))
            var id = Object.keys(lsns).find(l => l === args[1]);
        } else
            return;

        if(!id)
            return await message.reply(`Пара не найдена.`);
        log(`LESN`, `${message.member.user.tag} tries to end lesson ${id}`);
        await lessons.end(id, message.channel.id, message.author.id);
    }
}
