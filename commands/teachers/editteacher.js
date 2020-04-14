// submit homework to teachers channel

const teachers = require('../../functions/teachers.js');
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

// .editt teacher_id g|s
module.exports = {
    aliases: ["editt"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        if(args[1]) {
            // search teacher
            var t = teachers.obj.hasOwnProperty(args[1])?teachers.obj[args[1]]:'';
            if(!t)
                return await message.reply(`Teacher not found.`);
        }
        if(!args[1] || !args[2]) { // print info
            if(args[1]) var ts = [args[1]];
            else var ts = Object.keys(teachers.obj)
            for(const atk of ts) {
                const at = teachers.obj[atk]
                await message.channel.send({embed: {
                    title: `Teacher: \`${at.name}\``,
                    fields: [
                        {name: 'User', value: `<@${atk}>`, inline: true},
                        {name: 'Cathedra', value: `${at.cathedra}`, inline: true},
                        {name: 'Full name', value: `${at.name}`, inline: true},
                        {name: 'Channel', value: `<#${at.channel}>`, inline: true},
                        {name: 'Subjects', value: `[${at.subjects.join(', ')}]`, inline: true},
                        {name: 'Groups', value: `[${at.groups.join(', ')}]`, inline: true}
                    ],
                    footer: {text: at.cathedra},
                    color: 650815
                }});
            }
            return;
        }
        if(!['g', 's'].includes(args[2]))
            return await message.reply(`Specify valid option: g / s`);
        // parse new array
        const newOpt = args.slice(3).join(' ').split(/\//g).map(a => a.trim());
        // check groups
        if(args[2]==='g') {
            for(const opt of newOpt) {
                if(!groups.obj.hasOwnProperty(opt))
                    return await message.reply(`Group not found: \`${opt}\``);
            }
        }
        if(!(await confirm(message.channel, message.author.id, `Change ${args[2]==='g'?'groups':'subjects'} of \`${t.name}\` to \`[${newOpt.join(', ')}]\`?`)))
            return;
        if(args[2]==='g')
            t.groups = newOpt;
        else
            t.subjects = newOpt;
        teachers.jsonDump();
        log(`NOTE`, `Changed ${args[2]==='g'?'groups':'subjects'} of ${t.name} to [${newOpt.join(', ')}]`);
    }
}
