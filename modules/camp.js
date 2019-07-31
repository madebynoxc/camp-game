const $ = require("../globals");
const _ = require("./utils");

module.exports = {

	async do(userID, userName, args) {
		let elem = args.shift();
		switch(elem) {
			case "new":
				return await newc(userID, userName, args);
			case "name":
				return await name(userID, args);
			case "build":
				return await build(userID, args);
			case "clean":
				return await clean(userID);
			case "scout":
				return await scout(userID, args);
			case "resources":
				return await resources(userID);
			default:
				return await info(userID, userName);
		}
	}
}

async function scout(userID, args) {
	let camp = await $.col.camps.findOne({"owner": userID});
	if(!camp)
		return "Seems like you don't have a camp. To set up one run `/camp new`";

	if(camp.action)
		return `You already **${camp.action.name}**`

	let level = parseInt(args[0]);
	if(!level || level > 3 || level < 1)
		return `Please specify scouting level:\n1. Short walk (3m)\n2.Exploration (15m)3. Expedition (1h)`

	let timeLevels = [3, 15, 60];
	let time = new Date((new Date()).getTime() + 1000 * 60 * timeLevels[level]);
	camp.action = {
		id: "scout",
		name: "scouting area",
		drain: 3,
		expires: time,
		exp: 1
	}

	$.col.camps.save(camp);
	return `Started scouting for resources. Ends in: **${_.timeLeft(time)}**`;
}

async function resources(userID) {
	let camp = await $.col.camps.findOne({"owner": userID});
	if(!camp)
		return "Seems like you don't have a camp. To set up one run `/camp new`";

	if(camp.resources.length == 0)
		return "You don't have any resources. Collect them by scouting the area using `/camp scout`";

	let res = "";
	for (var i = 0; i < camp.resources.length; i++) {
		res += `${camp.resources[i].name} (${camp.resources[i].amount})\n`;
	}
	return res;
}

async function info(userID, userName) {
		let camp = await $.col.camps.findOne({"owner": userID});
		if(!camp)
			return "Seems like you don't have a camp. To set up one run `/camp new`";

		let timeToAction = '';
		if(camp.action) {
			timeToAction = _.timeLeft(camp.action.expires);
		}

		let loc = (await $.col.locations.find({"id": camp.location}).toArray())[0];
		let info = [];
		info.push(`Name: **${camp.name? camp.name : "<use `/camp name [name]` to set>"}**`);
		info.push(`Level: **${camp.level.toFixed(0)}**`);
		info.push(`Location: **${loc.name}**`);
		info.push(`Owner: **${userName}**`);
		info.push(`Energy: **${camp.energy.toFixed(1)}**`);
		info.push(`Garbage: **${(camp.action && camp.action.id == "clean")? "cleaning..." : camp.garbage.toFixed(1)}**`);
		info.push(`Resources: **${camp.resources.length}** (\`/camp resources\` to view)`);
		info.push(`Currently **${camp.action? camp.action.name : "doing nothing"}** ${timeToAction}`);
		return info.join('\n');
	}

	async function build(userID, args) {
		return "Build something great...";
	}

	async function name(userID, args) {
		let camp = await $.col.camps.findOne({"owner": userID});
		if(!camp)
			return "Seems like you don't have a camp. To set up one run `/camp new`";

		camp.name = args.join(' ');
		await $.col.camps.save(camp);
		return "Name has been updated";
	}

	async function clean(userID) {
		let camp = await $.col.camps.findOne({"owner": userID});
		if(!camp)
			return "Seems like you don't have a camp. To set up one run `/camp new`";

		if(camp.action)
			return `You already **${camp.action.name}**`

		if(camp.garbage < 1.0)
			return `You can start cleaning only when amount of garbage is **more than 1**`;

		let time = new Date((new Date()).getTime() + camp.garbage * 1000 * 60 * 5);
		camp.action = {
			id: "clean",
			name: "cleaning campsite",
			drain: 1.5,
			expires: time,
			exp: camp.garbage * .5
		}

		$.col.camps.save(camp);
		return `Started camp cleaning. Ends in: **${_.timeLeft(time)}**`;
	}

	async function newc(userID, userName, args) {
		try {
			let resp = await $.col.camps.find({"owner": userID}).toArray();
			if(resp.length > 0)
				return _.f(userName, "you already have a camp!");

			let loc = (await $.col.locations.find({"id": parseInt(args)}).toArray())[0];
			if(loc) {
				await $.col.camps.insertOne({
					"owner": userID, 
					"location": loc.id,
					"resources": [],
					"level": 0,
					"energy": 100.0,
					"protection": 1,
					"comfort": 1,
					"food": 5,
					"garbage": 1

				});

				return _.f(userName, `new camp established in **${loc.name}**. Run \`/camp\` to view`);
			}

		} catch { }

		let locs = await $.col.locations.find().toArray();
		let locList = [];
		for (let i = 0; i < locs.length; i++) {
			locList.push(`${(i + 1)}. **${locs[i].name}**`);
		}

		return _.f(userName, "you need to specify a location."
			+"\nSelect one and run `/camp new [location #]`:\n"
			+ locList.join("\n"));
	};	
