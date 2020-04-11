// submit homework to teachers channel

const teachers = require('../../functions/teachers.js');
const groups = require('../../functions/groups.js');
const config = require('../../json/config.json');
const confirm = require('../../functions/reactConfirm.js');

// .hw teacher_name / comme nt
module.exports = {
    dm: true,
    aliases: ["hw", "дз"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g).slice(1).join(' ');
        // search student
        let g = false; let stud;
        for(const ag in groups.obj) {
            if(!Object.values(groups.obj[ag].members).includes(message.author.id))
                continue;
            g = ag;
            stud = Object.keys(groups.obj[ag].members).find(k => message.author.id === groups.obj[ag].members[k]);
        }
        if(message.attachments.array().length < 1)
            return await message.reply(`Прикрепите файл.`);
        // search teacher
        const namePart = args.indexOf('/')>=0?args.slice(0, args.indexOf('/')).trim():args;
        const found = Object.keys(teachers.obj).filter(t => teachers.obj[t].name.startsWith(namePart));
        if(found.length < 1)
            return await message.reply(`Преподаватель не найден: \`${namePart}\``);
        if(found.length > 1)
            return await message.reply(`Найдено несколько преподавателей по запросу \`${namePart}\`:\n${found.map(f => `\`${teachers.obj[f].name}\`\n`)}`);
        const t = found[0];
        if(!teachers.obj[t].groups.includes(g))
            return await message.reply(`Группа \`${g}\` не указана у преподавателя \`${teachers.obj[t].name}\`. Если это ошибка, обратитесь к администратору.`);
        const subj = await teachers.chooseSubj(t, message);
        if(!subj) return;
        const comment = args.indexOf('/')>=0?args.slice(args.indexOf('/')+1).trim():'';
        // parse attachments
        const att = message.attachments.array()[0];
        // fetch role for color
        let role = await client.channels.fetch(config.channels.teachers);
        role = await role.guild.roles.fetch(groups.obj[g].role);
        const embed = {
            title: `**${att.height?'':'⬆️ ⬆️ ⬆️ '}${subj} : ${g} : ${stud}**`,
            fields: comment?[{name:'Comment', value:comment}]:null,
            image: att.height?{url: att.url}:null,
            color: role.color
        }
        await message.channel.send(`Preview:`, {embed:embed, files:att.height?[]:[att.url]});
        if(!(await confirm(message.channel, message.author.id, `Все верно? Отправить преподавателю \`${teachers.obj[t].name} (${teachers.obj[t].cathedra})\`?`)))
            return;
        const ch = await client.channels.fetch(teachers.obj[t].channel);
        await ch.send({files:att.height?[]:[att.url], embed:embed});
    }
}
