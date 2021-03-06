// set list of group members

const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js')


// ex:
// .setlist икбо-07-19\nMember1\nMember2
module.exports = {
    aliases: ["updchs"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return
        let nf = [], toUpdate = [], toUpdateShow = '';
        for(const c of message.guild.channels.cache.array()) {
            if(!c.name.match(/....-..-../))
                continue;
            const g = c.name.toLowerCase();
            if(!groups.findGroup(g)) {
                if(!nf.includes(g))
                    nf.push(g)
                continue;
            }
            const ows = [
                {id: config.roles.elder, allow: ['MANAGE_MESSAGES','MUTE_MEMBERS'], type: 'role'},
                {id: groups.obj[g].role, allow: 'VIEW_CHANNEL', type: 'role'},
                {id: message.guild.roles.everyone.id, deny: 'VIEW_CHANNEL', type: 'role'}
            ];
            let ok = true;
            for(const ow of c.permissionOverwrites.array()) {
                //console.log('a '+ow.id)
                const found = ows.find(o =>  o.id === ow.id);
                if(!found) {
                    ok = false;
                    break;
                }
                if(!ow.allow.equals(found.allow)) {
                    ok = false;
                    break;
                }
            }
            if(!ok) {
                // actually update after confirm
                //if(!(await confirm(message.channel, message.author.id, `Update overwrites for \`${c.name}\` (${c.type})?`)))
                //    return;
                //await c.overwritePermissions(ows);
                toUpdateShow+=`${c.name} (${c.type})\n`;
                toUpdate.push({c: c, ow: ows});
            }
        }
        await message.channel.send(`WARN unregistered: \`${nf.join(' ')}\``);
        if(!(await confirm(message.channel, message.author.id, `Update overwrites for channels:\n\`\`\`\n${toUpdateShow}\`\`\``)))
            return;
        for(const p of toUpdate)
            await p.c.overwritePermissions(p.ow);
    }
}
