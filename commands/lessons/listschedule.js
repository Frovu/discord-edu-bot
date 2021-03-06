
const lessons = require('../../functions/lessons.js');
const teachers = require('../../functions/teachers.js');
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const color = require('../../functions/getcolor.js');

function getDay(date) {
    return ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][date.getDay()];
}
// .lsch [teacher|group]
module.exports = {
    aliases: ["lsch", "расписание"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        let chk;
        if(!args[1]) {
            if(!message.member.roles.cache.has(config.roles.admin))
                return await message.reply(`Укажите группу или преподавателя.`);
            else
                chk = (l)=>{return true;};
        }
        if(!chk) {
            var t = teachers.find(args.slice(1).join(' '));
            if(!t) {
                var g = groups.findGroup(args[1]);
                if(!g)
                    return await message.reply(`Преподаватель/группа не найдены: \`${args[1]}\`.`);
                chk = (l)=>{return l.groups.includes(args[1]);};
            } else
                chk = (l)=>{return l.teacher === t;};
        }
        let i=0;
        let embed = {
            title: `Расписание ${t?'преподавателя '+teachers.obj[t].name:(g?'группы '+g.toUpperCase():'')}`,
            description: '',
            color: color()
        }
        let lastwd = -1;
        const getAppend = (al)=>{
            if(!t && !g)
                return `${teachers.obj[al.teacher].name} ${al.groups.map(ag=>ag.toUpperCase()).join(', ')}`
            return t ? al.groups.map(ag=>ag.toUpperCase()).join(', ') : teachers.obj[al.teacher].name;
        }
        for(const l of lessons.obj.scheduled.sort((a,b)=>{return a.start.valueOf()-b.start.valueOf();})) {
            if(chk(l)) {
                if(lastwd !== l.start.getDay()) {
                    lastwd = l.start.getDay();
                    embed.description += `**${getDay(l.start)}:**\n`;
                }
                const dstr = l.start.toString();
                embed.description += `${dstr.match(/ (..:..)/)[1]} (${dstr.match(/(... \d{2})/)[1]}) - **${l.subj}**(${l.type}): ${getAppend(l)}\n`;
                i++;
            }
        }
        if(i < 1)
            embed.description = `Нет запланированных пар.`;
        return await message.channel.send({embed:embed});
    }
}
