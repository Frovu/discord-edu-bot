
const teachers = require('../../functions/teachers.js');
const lessons = require('../../functions/lessons.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

module.exports = {
    aliases: ["unsch"],
    exec: async function(message) {
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const args = message.content.split(/\n| +/g);
        if(args[1] && !teachers.obj.hasOwnProperty(args[1]))
            return await message.reply(`Укажите id существующего преподавателя.`);
        let msg = ''; let i=0;
        for(const l of lessons.obj.scheduled) {
            if(!args[1] || (l.teacher == args[1]))
                msg+=`${i}. ${l.subj} ${l.type}\t${l.start.toISOString().replace(/\..+/,'')} \t${args[1]?'':teachers.obj[l.teacher].name+'('+l.teacher+')'} \t${l.groups.join(', ')}\n`;
            i++;
        }
        await message.channel.send(`**Select lesson to remove:**\`\`\`\n${msg}\`\`\``, {split:{append:'```', prepend: '```'}});
        const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, {time: 120000});
        collector.on('collect', async m => {
            const n = parseInt(m.content);
            if(isNaN(n) || n<0 || n>i-1)
                return await message.reply('Not a valid number.');
            const l = lessons.obj.scheduled[n];
            if(await confirm(message.channel, message.author.id, {embed: {
                title: `Delete scheduled lesson: ${l.subj} (${l.type}) ?`,
                fields: [
        			{name: 'Преподаватель', value: teachers.obj[l.teacher].name, inline: true},
        			{name: 'Группы', value: l.groups.map(g => g.toUpperCase()).join(', '), inline: true},
        			{name: 'Время начала', value: l.start.toString().replace(/:.. .+/, ''), inline: true},
        			{name: 'Через', value: `${Math.floor((l.start-Date.now())/60000)} минут`, inline: true},
        			{name: 'Повторение', value: l.repeat, inline: true}
        		]
            }})) {
                lessons.obj.scheduled.splice(n, 1); // rm from schedule
                lessons.jsonDump();
                collector.stop();
                log(`LESN`, `${message.author.id} removed lsn ${teachers.obj[l.teacher].name} t=${l.start.toISOString()} for schedule.`);
                await message.reply(`Lesson removed.`);
            }
        });
    }
}
