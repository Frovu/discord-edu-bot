const teachers = require('../../functions/teachers.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');
const resolve = require('../../functions/resolveTarget.js');

module.exports = {
    aliases: ["addteacher"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        const target = await resolve(message, args[1]);
        if(!target)
            return await message.reply(`Target not found: \`${args[1]}\``);
        const name = args.slice(3).join(' ');
        if(teachers.obj.hasOwnProperty(target.id) || teachers.find(name))
            return await message.reply(`Already registered.`);
        const cathedra = args[2].toUpperCase();

        const chname = `${cathedra}-${name.replace(/ ([А-Я])[а-яё]+/g, "-$1")}`
        // ask confirmation
        if(!(await confirm(message.channel, message.author.id, {embed: {
            title: `Register teacher: \`${name}\``,
            fields: [
                {name: 'User', value: `${target}`, inline: true},
                {name: 'Cathedra', value: `${cathedra}`, inline: true},
                {name: 'Full name', value: `${name}`, inline: true},
                {name: 'Channel name', value: `${chname}`, inline: true},
                {name: 'Groups', value: `[]`, inline: true},
                {name: 'Subjects', value: `[]`, inline: true}
            ],
            footer: {text: cathedra},
            color: 650815
        }})))
            return;
        // give role
        await target.roles.add(config.roles.teacher);
        // create personal channel
        const ch = await message.guild.channels.create(chname, {
            parent: config.channels.teachers,
            permissionOverwrites: [
                {id: target.id, allow: 'VIEW_CHANNEL', type: 'member'},
                {id: message.guild.roles.everyone, deny: 'VIEW_CHANNEL', type: 'role'}
            ]
        });
        teachers.obj[target.id] = {
            name: name,
            cathedra: cathedra,
            channel: ch.id,
            subjects: [],
            groups: []
        }
        teachers.jsonDump();
        log(`NOTE`, `Teacher added: ${cathedra} : ${name}`);
    }
};
