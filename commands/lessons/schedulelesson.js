
const groups = require('../../functions/groups.js');
const lessons = require('../../functions/lessons.js');
const teachers = require('../../functions/teachers.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

// if used as standalone command(admin): .schedule teacher_id type repeat_type time date
// if used from wrappers (by teacher) (.лк .пр): .лк repeat_type time date
module.exports = {
    aliases: ["schedule", "задать"],
    exec: async function(message, at, type) {
        const args = message.content.split(/\n| +/g);
        if(!message.member.roles.cache.has(config.roles.admin) && (!at || args[1] === 'now'))
            return;
        const t = at ? at : args[1];
        if(!teachers.obj.hasOwnProperty(t))
            return await message.reply(`Преподаватель не найден.`);
        const type = at ? type : args[2];
        if(!['лк', 'пр'].includes(type))
            return await message.reply(`Неизвестный тип пары: \`${type}\``);

        const ai = at ? 0 : 2; // args number increment
        const rpt = args[1+ai];
        if(rpt !== 'now') {
            var date = new Date(args[3+ai]);
            if(isNaN(date))
                date = new Date();
            date.setHours(0,0,0,0);
            // parse time
            if(!args[2+ai])
                return await message.reply(`Укажите время.`);
            if(!args[2+ai].match(/^[0-9]{1,2}:[0-9]{2}$/))
                return await message.reply(`Укажите время в формате \`99:99\`.`);
            const time = args[2+ai].split(':');
            date.setHours(time[0],time[1],0,0);
        } else {
            var date = new Date(Date.now()+80000); // +80sec
        }

        const subj = await teachers.chooseSubj(t, message);
        // parse groups and duration
        let gs = []; let duration = 120*60000; let gnt = [];
        for(const ag in args.slice(3+ai)) {
            if(ag.includes(':')) continue;
            if(ag.includes('d=')) {
                duration = parseInt(ag.replace('d=', ''));
                continue;
            }
            const g = groups.findGroup(ag);
            if(!g)
                return await message.reply(`Группа не найдена: \`${ag}\``);
            gs.push(g);
            if(!teachers.obj[t].groups.includes(g))
                gnt.push(g);
        }
        // ask confirmation
        if(!(await confirm(message.channel, message.author.id, {embed: {
            title: `Задать пару **${subj} ${type}** ?`,
            description: gnt.length>0?`Внимание! Группы (${gnt.map(h=>`\`${g}\``).join(', ')}) не указаны у преподавателя.`:``,
            fields: [
                {name: 'Преподаватель', value: teachers.obj[t].name, inline: true},
                {name: 'Группы', value: gs.map(g => g.toUpperCase()).join(', '), inline: true},
                {name: 'Время начала', value: time.toString().replace(/:.. .+/, ''), inline: true},
                {name: 'Начнется через', value: `${Math.floor((time-Date.now())/60000)} минут`, inline: true},
                {name: 'Продолжительность', value: `${Math.floor(duration/60000)} минут`, inline: true},
                {name: 'Повторение', value: `${['now', 'once'].includes(rpt)?'один раз':(rpt==='weekly'?'еженедельно':(rpt==='biweekly'?'каждые две недели':'???'))}`, inline: true}
            ],
            footer: teachers.obj[t].cathedra
        }})))
            return;

        if(rpt === 'now') {
            if(!(await lessons.spawn(t, subj, date, type, gs, duration)))
                return await message.reply(`Невозможно создать пару`);
        } else if(['once', 'weekly', 'biweekly'].includes(rpt)) {
            if(!(await lessons.schedule())) // TODO ARGS
                return await message.reply(`Невозможно создать пару`);
        } else {
            return await message.reply(`Неизвестный тип повторения: \`${rpt}\``);
        }
        return await message.reply(`Успешно`);
    }
}
