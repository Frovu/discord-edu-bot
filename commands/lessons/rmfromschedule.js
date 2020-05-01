
const teachers = require('../../functions/teachers.js');
const lessons = require('../../functions/lessons.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

// usage: .usch skip|rm [<teacher_id>]
module.exports = {
    aliases: ["unsch", "usch"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        if(!['rm', 'skip'].includes(args[1]))
            return await message.reply(`Valid options: \`rm, skip\``);
        if(args[2] && !teachers.obj.hasOwnProperty(args[2]))
            return await message.reply(`Укажите id существующего преподавателя.`);
        let msg = ''; let i=0;
        for(const l of lessons.obj.scheduled) {
            if(!args[2] || (l.teacher == args[2]))
                msg+=`${i}. ${l.subj} ${l.type}\t${l.start.toISOString().replace(/\..+/,'')} \t${args[2]?'':teachers.obj[l.teacher].name+'('+l.teacher+')'} \t${l.groups.join(', ')}\n`;
            i++;
        }
        await message.channel.send(`**Select lesson to ${args[1]=='rm'?'remove':'skip'}:**\`\`\`\n${msg}\`\`\``, {split:{append:'```', prepend: '```'}});
        const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, {time: 120000});
        collector.on('collect', async m => {
            const n = parseInt(m.content);
            if(isNaN(n) || n<0 || n>i-1)
                return await message.reply('Not a valid number.');
            const l = lessons.obj.scheduled[n];
            if(await confirm(message.channel, message.author.id, {embed: {
                title: `${args[1]=='rm'?'Remove':'Skip'} scheduled lesson: ${l.subj} (${l.type}) ?`,
                fields: [
        			{name: 'Преподаватель', value: teachers.obj[l.teacher].name, inline: true},
        			{name: 'Группы', value: l.groups.map(g => g.toUpperCase()).join(', '), inline: true},
        			{name: 'Время начала', value: l.start.toString().replace(/:.. .+/, ''), inline: true},
        			{name: 'Через', value: `${Math.floor((l.start-Date.now())/60000)} минут`, inline: true},
        			{name: 'Повторение', value: l.repeat, inline: true}
        		]
            }})) {
                lessons.skip(n, args[1]==='rm');
                collector.stop();
                log(`LESN`, `${message.author.id} skipped lsn ${teachers.obj[l.teacher].name} t=${l.start.toISOString()}`);
                await message.reply(`Lesson ${args[1]=='rm'?'removed':'skiped'}.`);
            }
        });
    }
}
