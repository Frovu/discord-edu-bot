// submit homework to teachers channel

const teachers = require('../../functions/teachers.js');
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

// .editt teacher_id g|s
module.exports = {
    aliases: ["editt"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        // search teacher
        const t = teachers.obj.hasOwnProperty(args[1])?teachers.obj[args[1]]:'';
        if(!t)
            return await message.reply(`Teacher not found.`);
        if(!args[2]) { // print info
            return await message.channel.send({embed: {
                title: `Teacher: \`${t.name}\``,
                fields: [
                    {name: 'User', value: `<@${args[1]}>`, inline: true},
                    {name: 'Cathedra', value: `${t.cathedra}`, inline: true},
                    {name: 'Full name', value: `${t.name}`, inline: true},
                    {name: 'Channel', value: `<#${t.channel}>`, inline: true},
                    {name: 'Subjects', value: `[${t.subjects.join(', ')}]`, inline: true},
                    {name: 'Groups', value: `[${t.groups.join(', ')}]`, inline: true}
                ],
                footer: {text: t.cathedra},
                color: 650815
            }});
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
