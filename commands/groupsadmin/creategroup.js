
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');
const getColor = require('../../functions/getcolor.js');

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
        if(groups.findGroup(args[1]))
            return await message.reply(`Group already exist: \`${name}\``);
        const color = getColor();
        if(args[2] === 'new') {
            // create new group
            try{var elder = await message.guild.members.fetch(args[3]);}catch(e){}
            if(!elder)
                return await message.reply(`Can\'t resolve elder from \`${args[3]}\``);
            if(!(await confirm(message.channel, message.author.id, {embed: {
                title: `Создать \`${name}\`?`,
                description: `Староста: ${elder}`,
                color:  parseInt(color, 16)
            }})))
                return;
            // give elder role
            elder.roles.add(config.roles.elder).then().catch(()=>{log(`ERR`, `Failed to give elder role to ${elder.user.tag}(${elder.id})`)});
            // create role
            var members = {};
            members[elder.user.username] = elder.id;
            var role = await message.guild.roles.create({data: {
                name: name.toUpperCase(),
                hoist: true,
                mentionable: true,
                permissions: 0,
                color: parseInt(color, 16)
            }})
            var tc = await message.guild.channels.create(name, {
                permissionOverwrites: [
                    {id: config.roles.elder, allow: 'MANAGE_MESSAGES', type: 'role'},
                    {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                    {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'}
                ]
            });
            var vc = await message.guild.channels.create(name.toUpperCase(), {
                type: 'voice',
                permissionOverwrites: [
                    {id: config.roles.elder, allow: 'MUTE_MEMBERS', type: 'role'},
                    {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                    {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'}
                ]
            });
            elder.roles.add(config.roles.student).then().catch(()=>{log(`ERR`, `Failed to give student role to ${elder.user.tag}(${elder.id})`)});
            elder.roles.add(role).then().catch(()=>{log(`ERR`, `Failed to give g role to ${elder.user.tag}(${elder.id})`)});
        } else if(args[2] === 'auto') {
            // automatically search for group role and channels
            await message.guild.roles.fetch();
            var role = await message.guild.roles.cache.find(r => r.name.toLowerCase() === name);
            var tc = await message.guild.channels.cache.find(c => c.name.toLowerCase() === name && c.type === 'text');
            var vc = await message.guild.channels.cache.find(c => c.name.toLowerCase() === name && c.type === 'voice');
            if(!vc || !tc || !role)
                return await message.reply(`Can\'t find role and channels.`);
            // parse members
            var members = {};
            var elders = [];
            let list = ''; let i=0;
            for(const m of role.members.array()) {
                if(m.roles.cache.has(config.roles.elder))
                    elders.push(m.id);
                members[m.nickname] = m.id;
                list+=`\`${++i}.\` ${m}${elders.includes(m.id)?' elder':''}\n`;
            }
            const embed = {
                title: `Automatically creating \`${name}\``,
                fields: [
                    {name: 'Role', value: `${role}`, inline: true},
                    {name: 'TextCh', value: `${tc}`, inline: true},
                    {name: 'Voice', value: `${vc}`, inline: true},
                    {name: 'new color', value: `#${color}`, inline: true},
                    {name: 'elders', value: `${elders.map(e => {return `<@${e}>`}).join(', ')}`},
                    {name: 'members', value: `${list}`},
                ],
                footer: {text: name},
                color: parseInt(color, 16)
            };
            // ask confirmation
            if(!(await confirm(message.channel, message.author.id, {embed: embed})))
                return;
            // update channels perms
            await tc.overwritePermissions([
                {id: config.roles.moderator, allow: 'VIEW_CHANNEL', type: 'role'},
                {id: config.roles.elder, allow: 'MANAGE_MESSAGES', type: 'role'},
                {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'},
            ]);
            await vc.overwritePermissions([
                {id: config.roles.moderator, allow: 'MUTE_MEMBERS', type: 'role'},
                {id: config.roles.elder, allow: 'MUTE_MEMBERS', type: 'role'},
                {id: role.id, allow: 'VIEW_CHANNEL', type: 'role'},
                {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'},
            ]);
            // change role color
            await role.setColor(color);
        } else {
            return await message.reply(`Specify option (new/auto).`);
        }
        groups.obj[name] = {
            role: role.id,
            channel: tc.id,
            vc: vc.id,
            elders: elders ? elders : [elder.id],
            members: members
        }
        groups.jsonDump();
        log(`NOTE`, `Group created: ${name}`);
    }
};
