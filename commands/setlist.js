// set list of group members

const groups = require('../functions/groups.js');
const config = require('../json/config.json');
const confirm = require('../functions/reactConfirm.js')
const request = require('request');
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
        let members = {}; let file = '';
        const url = message.attachments.first().url;
        setTimeout(()=>{request.head(url, function(err, res, body) {
		    request(url).on('data', (data) => {
                file += data.toString();
                console.log(data)
            });
            request(url).on('close', async() => {
                for(const m of file.split('\n')) {
                    // search for existing members with same family
                    const filtered = Object.keys(groups.obj[g].members).filter(a => a.startsWith(m.split(' ')[0]));
                    // if found two people with same name part, do not keep
                    console.log(filtered)
                    if(filtered.length === 1) // keep already existing users
                        members[m] = groups.obj[g].members[filtered[0]];
                    else
                        members[m] = null;
                }
                // show preview and ask confirm
                if(!(await confirm(message.channel, message.author.id,`\`\`\`json\n${JSON.stringify(members, null, 2)}\`\`\``)))
                    return;
                groups.obj[g].members = members;
                groups.jsonDump();
                return await message.reply(`Список \`${g}\` успешно обновлен.`); // not found
            });
		});}, 500);
    }
}

exports.Download = function(uri, filename, callback) {
	try {
		request = require('request');
		request.head(uri, function(err, res, body){
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);

			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	} catch (e){
		logs.Log(`ERROR`, `Exception in Download:\n${e.stack}`);
	}
};
