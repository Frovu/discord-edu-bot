
module.exports = {
    aliases: ["ping"],
    exec: async function(message) {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    	// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    	const m = await message.channel.send("Ping?");
    	m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. WebSocket ping is ${Math.round(client.ws.ping)}ms.`);
    	log(`MSG`, `${message.author.tag} pinged in ${message.channel.name}: ${m.createdTimestamp - message.createdTimestamp}ms. ws: ${Math.round(client.ws.ping)}ms.`);
    }
};
