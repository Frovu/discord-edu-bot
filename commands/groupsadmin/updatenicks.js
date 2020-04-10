// set list of group members

const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js')

// ex:
// .setlist икбо-07-19\nMember1\nMember2
module.exports = {
    aliases: ["updaten"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return
        const args = message.content.split(/\n| +/g);
        const g = groups.findGroup(args[1]);
        if(!g)
            return await message.reply(`Группа не найдена: \`${args[2]}\``); // not found
        // set new nicks
        const role = await message.guild.roles.fetch(groups.obj[g].role);
        let note = '';
        let toChange = {};
        for(const m of role.members.array()) {
            // give student role if needed
            if(!m.roles.cache.has(config.roles.student))
                m.roles.add(config.roles.student).then().catch(()=>{log(`ERR`, `Failed to give student role to ${m.user.tag}(${m.id})`)});
            if(!Object.values(groups.obj[g].members).includes(m.id)) {
                note+=`WARN: ${m} not in list.\n`;
                continue;
            }
            let newn = Object.keys(groups.obj[g].members).find(a => groups.obj[g].members[a]===m.id);
            if(groups.getNick(newn) !== m.nickname) {
                note += `\`${m.nickname} => ${groups.getNick(newn)}\`\n`;
                toChange[newn] = m;
            }
        }
        if(!(await confirm(message.channel, message.author.id, `changes to be done:\n\n${note}`)))
            return;
        for(const a in toChange) {
            toChange[a].setNickname(groups.getNick(a)).then().catch(()=>{log(`ERR`, `Failed to set nick for ${toChange[a].user.tag} ${toChange[a].id}`)});
        }
    }
}
