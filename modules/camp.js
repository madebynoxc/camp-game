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
	return "Souting area...";
}

async function resources(userID) {
	let camp = await $.col.camps.findOne({"owner": userID});
	if(!camp)
		return "Seems like you don't have a camp. To set up one run `/camp new`";

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
			let tr = (camp.action.expires - new Date());
			timeToAction = `(${tr.getHours()}h ${tr.getMinutes()}m ${tr.getSeconds()}s)`
		}

		let loc = (await $.col.locations.find({"id": camp.location}).toArray())[0];
		let info = [];
		info.push(`Name: **${camp.name? camp.name : "<use `/camp name [name]` to set>"}**`);
		info.push(`Level: **${camp.level}**`);
		info.push(`Location: **${loc.name}**`);
		info.push(`Owner: **${userName}**`);
		info.push(`Energy: **${camp.energy}**`);
		info.push(`Garbage: **${camp.garbage}**`);
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
		let camp = (await $.col.camps.find({"owner": userID}).toArray())[0];
		if(!camp)
			return "Seems like you don't have a camp. To set up one run `/camp new`";

		
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
					"garbage": 0

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