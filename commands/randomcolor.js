const getColor = require('../functions/getcolor.js')

module.exports = {
    aliases: ["color"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const arg = message.content.split(/ +/g)[1];
        let n = parseInt(arg);
        if(!n || isNaN(n))
            n = 1;
        for(let i=0; i<n; ++i) {
            let c = getColor();
            await message.channel.send({embed: {
                title: 'a color',
                description: `#${c}`,
                color: parseInt(c, 16)
            }});
        }
    }
};
