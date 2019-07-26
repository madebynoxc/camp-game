const Discord = require("discord.io");
const config = require("./config");
const MongoClient = require('mongodb').MongoClient;
const $ = require("./globals");

const _ = require("./modules/utils");
const camp = require("./modules/camp");
const store = require("./modules/store");
const user = require("./modules/user");

$.bot = new Discord.Client({
	token: config.token
});

MongoClient.connect(config.database, { useNewUrlParser: true }, (err, client) => {
	console.log("Connected to database");

	$.mongo = client.db("camp");
	$.col.data = $.mongo.collection("data");
	$.col.camps = $.mongo.collection("camps");
	$.col.locations = $.mongo.collection("locations");
	$.col.users = $.mongo.collection("users");
	$.bot.connect();
});

$.bot.on("ready", event => {
	console.log("Bot ready");
	$.bot.setPresence({game: {name: "in a camp"}});
	sendMessage("The camp is here");
});

$.bot.on("message", async (username, userID, channelID, message, event) => { 
	if(!message.startsWith("/"))
		return;

	var curUser = $.bot.users[userID];
	if(curUser.bot)
		return;

	if(!await user.exists(userID)) {
		await user.create(userID);
		sendMessage(_.f(username, "welcome to **The Camp Game △**"));
	}

		let reply = "Run `/help` to find out more";
		let args = message.split(' ');
		let command = args.shift().substring(1);

		switch(command) {
			case "camp":
				reply = await camp.do(userID, username, args);
				break;
			case "scout":
				reply = await camp.scout(userID, args);
				break;
			case "store":
				reply = await store.do(userID, username, args);
				break;
			case "help":
				reply = await getHelp();
				break;
		}

		sendMessage(reply);
});

async function getHelp() {

}

function sendMessage(msg) {
	var res = _.embed(_.colors.default, msg);
	$.bot.sendMessage({to: config.channel, embed: res}, (err, resp) => {
       	if(err) console.log(err);
    });
}

