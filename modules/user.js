const $ = require("../globals");
const _ = require("./utils");

module.exports = {

	async exists(userID) {
		let u = await $.col.users.findOne({"discord_id": userID});
		return u? true : false;
	},

	async create(userID) {
		let newUser = {
			"discord_id": userID,
			"achievements": [],
			"camping": 0,
			"credits": 200,
			"inventory": []
		};

		await $.col.users.insertOne(newUser);
	},

	async inventory(userID, username) {
		let user = await $.col.users.findOne({"discord_id": userID});
		if(user.inventory.length == 0)
			return _.f(username, "your inventory is empty. Buy something from the `/store`");

		let res = "";
		for (var i = 0; i < user.inventory.length; i++) {
			res += `${(i + 1)}. ${user.inventory[i].name}\n`;
		}

		return res;
	}
}