// set list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .setlist икбо-07-19\nMember1\nMember2
module.exports = {
    aliases: ["updaten"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return
        const args = message.content.split(/\n| +/g);
        if(!args[1])
            return await message.reply(`Укажите название группы.`); // not found
        const g = args[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
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
            if(!groups.obj[g].members.hasOwnProperty(m.nickname)) {
                let newn = Object.keys(groups.obj[g].members).find(a => groups.obj[g].members[a]===m.id);
                note += `\`${m.nickname} => ${newn}\`\n`;
                toChange[newn] = m;
            }
        }
        if(!(await confirm(message.channel, message.author.id, `changes to be done:\n\n${note}`)))
            return;
        for(const a in toChange) {
            toChange[a].setNickname(a).then().catch(()=>{log(`ERR`, `Failed to set nick for ${toChange[a].user.tag} ${toChange[a].id}`)});
        }
    }
}
