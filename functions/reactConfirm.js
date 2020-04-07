
/* Ask confirmation before doing some action

@channel  - discord channel we are working in
@author   - *id* for confirmer
@text     - (string) to ask caller
@timer    - how long to wait for response

@returns Promise (resolved with bool)
*/

module.exports = async function(channel, author, text, timer=30000){
	try {
		// ask a question
		const confirmMsg = await channel.send(text);
        await confirmMsg.react('✅');
        await confirmMsg.react('❌');
		return new Promise((resolve, reject)=>{
			const collector = confirmMsg.createReactionCollector((r, u) => u.id === author, { time: timer });
			collector.on('collect', r => {
				if(r.emoji.name === '✅') {
                    resolve(true);
					collector.stop('confirmed');
				} else if (r.emoji.name === '❌') {
					collector.stop('canceled');
				}
			});
			collector.on('end', (_, reason) => {
				if(reason!=='confirmed') {
                    resolve(false);
					channel.send('\\> Confirmation failed. Aborting.').then(msg=>{
						msg.delete({timeout: 5000}).then().catch(()=>{});
					});
				}
                //confirmMsg.delete().then().catch(e => log(`ERROR`, `deleting in rconfirm: ${e.stack}`));
			});
		});
	}  catch(e) {
		return log(`ERROR`, `Failed reactConfirmation: ${e.stack}`);
	}
}
