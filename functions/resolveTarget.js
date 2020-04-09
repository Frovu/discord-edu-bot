/*
// resolves targeted member of command (first cmd arg by default or [resolvable])
// returns member if resolved and false if not
@arg message - command message
@resolvable  - (string)(optional) use if target resolvable is not first arg of command
@ifmention   - (bool) default true. allow to search message.mentions
*/
module.exports = async function(message, resolvable, ifmention=true){
	// try to resolve arg
	let target;
	if(typeof resolvable === "undefined") { // by default all args
		resolvable = message.content.split(/ +/g).slice(1).join(' ');
		if(resolvable.length<4) return false;
	}
	resolvable = resolvable.toLowerCase();
	try{ target = await message.guild.members.fetch(resolvable); }catch(e){} // try as snowflake
	if(ifmention === true && message.mentions.members.array().length>0)
		try{ target = await message.guild.members(message.mentions.members.first()); }catch(e){}// if mentions
	//if(!target && resolvable.length < 6)
	//	return false; // too short resolvable for searching in nicks
	if(target)
		return target;
	// search nick
	target = await message.guild.members.cache.filter(x => x.displayName.toLowerCase().includes(resolvable));
	if(target.array().length !== 1) // search username
		target = await message.guild.members.cache.filter(x => x.user.username.toLowerCase().includes(resolvable));
	if(target.array().length === 1)
		return target.first();
	else
		return false;

}
