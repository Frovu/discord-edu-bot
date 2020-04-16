
const groups = require('../../functions/groups.js');
const lessons = require('../../functions/lessons.js');
const teachers = require('../../functions/teachers.js');
const config = require('../../json/config.json');

module.exports = {
    aliases: ["linfo", "инфо"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        if(!message.member.roles.cache.has(config.roles.admin))
            return;
        const vc = message.guild.channels.resolve(args[1]);
        if((!vc || !lessons.obj.ongoing.hasOwnProperty(vc.id)) && !message.member.roles.cache.has(config.roles.admin))
            return await message.reply(`Канал не найден.`);
        if(vc)
            var ls = [lessons.obj.ongoing[vc.id]];
        else
            var ls = Object.values(lessons.obj.ongoing);

        for(const l of ls) {
            let embed = {
                title: `**${l.subj} ${l.type}**`,
                fields: [
                    {name: 'Преподаватель', value: teachers.obj[l.teacher].name, inline: true},
                    {name: 'Группы', value: l.groups.map(g => g.toUpperCase()).join(', '), inline: true},
                    {name: 'Время начала', value: l.start.toString().replace(/:.. .+/, ''), inline: true},
                    {name: 'Идёт', value: `${Math.floor((Date.now()-l.start)/60000)} минут`, inline: true},
                    {name: 'Проверок', value: `${l.checks}`, inline: true},
                    {name: 'Продолжительность', value: `${Math.floor(l.duration/60000)} минут`, inline: true}
                ],
                footer: teachers.obj[l.teacher].cathedra
            }
            if(!embed.description && Object.keys(l.groups).length > 0)
                embed.description = '';
            for(const g of l.groups) {
                embed.description += `**\`${g.toUpperCase()}\`:**\n`;
                let i=0;
                for(const a in l.attended) {
                    const m = Object.keys(groups.obj[g].members).find(k => groups.obj[g].members[k] === a);
                    if(m)
                        embed.description += `\`${++i}\`. ${m.replace(/\+/g, '')}\t${l.attended[a]}/${l.checks} (**${(l.attended[a]/l.checks*100).toFixed(1)}%**)\n`;
                }
            }
            await message.channel.send({embed:embed});
        }
    }
}
