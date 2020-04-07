
const fs = require('fs');

// relative to project root
const jsonPath = 'json/groups.json';

// read or create empty object if not exist
try {
	var applications = require('../' + jsonPath);
} catch(e) {
	log(`NOTE`, `Can't read ${jsonPath}. Count as empty.`)
	var applications = new Object();
}

module.exports.obj = applications;

const jsonDump = () => fs.writeFileSync('./'+jsonPath, JSON.stringify(applications, null, 2), 'utf8', (err) => {
    if(err) log(`ERROR`, `Failed writing ${jsonPath}`);
});
module.exports.jsonDump = jsonDump;
