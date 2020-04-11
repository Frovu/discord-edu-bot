const fs = require('fs');
const config = require('../json/config.json');

// relative to project root
const jsonPath = 'json/teachers.json';

// read or create empty object if not exist
try {
	var teachers = require('../' + jsonPath);
} catch(e) {
	log(`NOTE`, `Can't read ${jsonPath}. Count as empty.`)
	var teachers = new Object();
}

module.exports.obj = teachers;

const jsonDump = () => fs.writeFileSync('./'+jsonPath, JSON.stringify(teachers, null, 2), 'utf8', (err) => {
    if(err) log(`ERROR`, `Failed writing ${jsonPath}`);
});
module.exports.jsonDump = jsonDump;

function find(namePart) {
    const found = Object.keys(teachers).filter(t => teachers[t].name.startsWith(namePart));
    if(found.length === 1)
        return found[0];
    return false;
}

module.exports.find = find;
