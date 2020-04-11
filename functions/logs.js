const fs = require('fs');
const path = './logs/';

if (!fs.existsSync(path)){
    fs.mkdirSync(path);
    console.log('Created log directory.');
}

function getFileName(date, msg=false){
	if(msg)
		return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.msgs`;
	return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.log`;
}

let logStream = fs.createWriteStream((path+getFileName(new Date())), {flags:'a'});

function logInFile(date, msg, topic){
    // create new log file if needed
	if(!logStream.path.endsWith(getFileName(date))) {
        logStream = fs.createWriteStream((path+getFileName(date)), {flags:'a'});
		module.exports('BOT', `Creating new logInFile: ${getFileName(date)}`);
	}
    logStream.write(msg + '\n');
    if(['ERROR'].includes(topic))
        client.users.fetch('236931374722973698').then(u=>u.send(`\`\`\`${msg}\`\`\``).then().catch(()=>{})).catch(()=>{});
}

function Pad (num, size) {
    return ('         ' + num).substr(-size);
}

function THeader (date) {
	return `[${Pad(date.getHours(),2)}:${Pad(date.getMinutes(),2)}]`;
}

// Date stuff
function DHeader (date) {
	return `[${Pad(date.getDate(),2)}/${Pad(date.getMonth()+1,2)}/${Pad(date.getFullYear(),2)}]`;
}

module.exports = function (topic, message) {
    const date = new Date();
    msg = `[${topic.padEnd(5)}]${DHeader(date)}${THeader(date)} ${message}`;

    // Loging to file
    logInFile(date, msg, topic)
    console.log(msg);
};
