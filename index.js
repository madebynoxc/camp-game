const Discord = require("discord.io");
const config = require("./config");
const MongoClient = require('mongodb').MongoClient;
const $ = require("./globals");

const _ = require("./modules/utils");

$.module.camp = require("./modules/camp");
$.module.store = require("./modules/store");
$.module.user = require("./modules/user");
$.module.task = require("./modules/task");
$.module.location = require("./modules/location");

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
	$.col.tasks = $.mongo.collection("tasks");
	$.bot.connect();
});

$.bot.on("ready", event => {
	console.log("Bot ready");
	$.bot.setPresence({game: {name: "in a camp"}});
	sendMessage("The camp is here");
	setInterval(tick, 5000);
});

$.bot.on("message", async (username, userID, channelID, message, event) => { 
	if(!message.startsWith("/"))
		return;

	var curUser = $.bot.users[userID];
	if(curUser.bot)
		return;

	if(!await $.module.user.exists(userID)) {
		await $.module.user.create(userID, username);
		sendMessage(_.f(username, "welcome to **The Camp Game △**"));
	}

		let reply = "Run `/help` to find out more";
		let args = message.split(' ');
		let command = args.shift().substring(1);

		switch(command) {
			case "camp":
				reply = await $.module.camp.do(userID, username, args);
				break;
			case "scout":
				reply = await $.module.camp.scout(userID, args);
				break;
			case "store":
				reply = await $.module.store.do(userID, username, args);
				break;
			case "inv":
				reply = await $.module.user.inventory(userID, username);
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

async function tick() {
	let write = [];
	let date = new Date();
	let camps = await $.col.camps.find().toArray();
	for (var i = 0; i < camps.length; i++) {
		let mul = 1;
		let set = {};
		let camp = camps[i];
		if(camp.action) {
			mul = camp.action.drain;
			if(date > camp.action.expires) {
				await onActionComplete(camp);
				let user = await $.col.users.findOne(camp.owner.id);
				let name = camp.name? camp.name : `campsite by ${user.username}`;
				sendMessage(`Task **${camp.action.id}** in **${camp.name}** is complete`);
				set.level = camp.level + camp.action.exp;
				set.action = null;
			}

			if(camp.action.id != "clean")
				set.garbage = camp.garbage + .01;
		}

		set.energy = camp.energy - .05 * mul;

		write.push({updateOne: {
			filter: {"_id": camp._id}, 
			update: {$set: set}
		}});
	}

	$.col.camps.bulkWrite(write);
}

async function onActionComplete(camp) {
	switch(camp.action.id) {
		case "clean":
			camp.garbage = 0;
			await $.col.camps.save(camp);
			break;
	}
}
