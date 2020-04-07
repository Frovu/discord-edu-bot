
const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')

// ex:
// .creategroup икбо-07-19 new elder_id
module.exports = {
    aliases: ["creategroup"],
    exec: async function(message) {
        // only for admin use
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/ +/g);
        const name = args[1].toLowerCase();
        if(groups.obj.hasOwnProperty(name))
            return await message.reply(`Group already exist: \`${name}\``);
        // check for valid elder
        if(args[2] === 'new') {
            // create new group
            const elder = await message.guild.members.fetch(args[3]);
            if(!elder)
                return await message.reply(`Can\'t resolve elder from \`${args[3]}\``);
            // create role
            var role = await message.guild.roles.create({data: {
                name: name.toUpperCase(),
                hoist: true,
                mentionable: true
            }})
            var tc = await message.guild.channels.create(name, {
                permissionOverwrites: [
                    {id: config.roles.moderator, allow: 'VIEW_CHANNEL', type: 'role'},
                    {id: config.roles.elder, allow: 'MANAGE_MESSAGES', type: 'role'},
                    {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                    {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'},
                ]
            });
            var vc = await message.guild.channels.create(name, {
                type: 'voice',
                permissionOverwrites: [
                    {id: config.roles.moderator, allow: 'MUTE_MEMBERS', type: 'role'},
                    {id: config.roles.elder, allow: 'MUTE_MEMBERS', type: 'role'},
                    {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                    {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'},
                ]
            });
        } else if(args[2] === 'auto') {
            // automatically search for group role and channels
            var role = await message.guild.roles.cache.find(r => r.name.toLowerCase() === name);
            var tc = await message.guild.channels.cache.find(c => c.name.toLowerCase() === name && c.type === 'text');
            var vc = await message.guild.channels.cache.find(c => c.name.toLowerCase() === name && c.type === 'voice');
            if(!vc || !tc || !role)
                return await message.reply(`Can\'t find role and channels.`);
            // parse members
            var members = {};
            var elders = [];
            for(const m of role.members.array()) {
                if(m.roles.cache.has(config.roles.elder))
                    elders.push(m.id);
                members[m.nickname] = m.id;
            }
            const text = `Found group. Role: ${role}, TextCh: ${tc}, Voice: ${vc}
Elders: ${elders.map(e => {return `<@${e}>`}).join(', ')}\nMembers:\`\`\`\n${Object.keys(members).join('\n')}\`\`\``;
            // ask confirmation
            if(!(await confirm(message.channel, message.author.id, text)))
                return;
        } else {
            return await message.reply(`Specify option (new/auto).`);
        }
        groups.obj[name] = {
            role: role.id,
            channel: tc.id,
            vc: vc.id,
            elders: elders ? elders : [elder.id],
            members: members ? members : {}
        }
        groups.jsonDump();
    }
};
