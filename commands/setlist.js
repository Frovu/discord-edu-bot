// set list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')
const https = require('https');
const fs = require('fs');

// ex:
// .setlist икбо-07-19\nMember1\nMember2
module.exports = {
    aliases: ["setlist"],
    exec: async function(message) {
        const args = message.content.split(/\n| +/g);
        if(!args[1])
            return await message.reply(`Укажите название группы.`); // not found
        const g = args[1].toLowerCase();
        if(!groups.obj.hasOwnProperty(g))
            return await message.reply(`Группа не найдена: \`${g}\``); // not found
        // check if admin or group elder
        if(!message.member.roles.cache.has(config.roles.admin))
            if(!message.member.roles.cache.has(config.roles.elder) || !groups.obj[g].elders.includes(message.author.id))
                return await message.reply(`Вы не являетесь старостой группы \`${g}\``);
        if(message.attachments.size <= 0)
            return await message.reply(`Прикрепите файл списка.`);
        // download file
        let members = {};
        const url = message.attachments.first().url;
        https.get(url, (msg) => {
            file = '';
            msg.setEncoding('utf8').on('data', (data) => {
                file += data;
            });
            msg.on('close', async() => {
                const role = await message.guild.roles.fetch(groups.obj[g].role);
                for(const m of file.replace(/\r/g, '').split('\n')) {
                    if(!m) continue;
                    // search for existing members with same family
                    const found = role.members.array().find(a => a.user.username.startsWith(m.split(' ')[0]+' ') || (a.nickname && (a.nickname.startsWith(m.split(' ')[0]+' ') || a.nickname.split(' ')[1].startsWith(m.split(' ')[0]))));
                    if(found) // keep already existing users
                        members[m] = found.id;
                    else
                        members[m] = null;
                }
                // show preview and ask confirm
                if(!(await confirm(message.channel, message.author.id,`\`\`\`json\n${JSON.stringify(members, null, 2)}\`\`\``)))
                    return;
                groups.obj[g].members = members;
                groups.jsonDump();
                return await message.reply(`Список \`${g}\` успешно обновлен.\n`); // not found
            });
		});
    }
}
