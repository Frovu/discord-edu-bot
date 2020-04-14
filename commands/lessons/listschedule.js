
const lessons = require('../../functions/lessons.js');
const teachers = require('../../functions/teachers.js');
const config = require('../../json/config.json');

// .lsch
module.exports = {
    aliases: ["lsch", "расписание"],
    exec: async function(message, at, atype) {
        //const args = message.content.split(/\n| +/g);
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        if(lessons.obj.scheduled.length < 1)
            return await message.channel.send(`No scheduled lessons.`);
        for(const l of lessons.obj.scheduled) {
            await message.channel.send({embed: {
                title: `**${l.subj} (${l.type})**`,
                fields: [
                    {name: 'Преподаватель', value: teachers.obj[l.teacher].name, inline: true},
                    {name: 'Группы', value: l.groups.map(g => g.toUpperCase()).join(', '), inline: true},
                    {name: 'Время начала', value: l.start.toString().replace(/:.. .+/, ''), inline: true},
                    {name: 'Начнется через', value: `${Math.floor((l.start-Date.now())/60000)} минут`, inline: true},
                    {name: 'Продолжительность', value: `${Math.floor(l.duration/60000)} минут`, inline: true},
                    {name: 'Повторение', value: `${['now', 'once'].includes(l.repeat)?'один раз':(l.repeat==='weekly'?'еженедельно':(l.repeat==='biweekly'?'каждые две недели':'???'))}`, inline: true}
                ],
                footer: teachers.obj[l.teacher].cathedra
            }});
        }
    }
}
