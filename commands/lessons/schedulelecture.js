
const config = require('../../json/config.json');
const schedule = require('./schedulelesson.js').exec;

module.exports = {
    aliases: ["лк"],
    exec: async function(message) {
        if(message.member.roles.cache.has(config.roles.teacher))
            await schedule(message, message.author.id, 'лк');
    }
}
