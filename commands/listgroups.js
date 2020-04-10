// get list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');

module.exports = {
    aliases: ["listg"],
    exec: async function(message) {
        // check if admin
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        let embed = {
            author: {
                name: client.user.username,
                icon_url: client.user.displayAvatarURL(),
            },
            description: '',
            title: `Listing groups`,
            footer: {text: `total: ${Object.keys(groups.obj).length}`},
            color: 8781774
        };
        for(const g of Object.keys(groups.obj).sort()) {
            const reged = Object.keys(groups.obj[g].members).filter(k => groups.obj[g].members[k]).length;
            embed.description += `**\`${g}\`** (**${reged}**/${Object.keys(groups.obj[g].members).length}) : ${groups.obj[g].elders.map(e => {return `<@${e}>`}).join(', ')}\n`;
        }
        await message.channel.send({embed: embed});
    }
}
