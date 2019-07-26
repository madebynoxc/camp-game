const $ = require("../globals");
const _ = require("./utils");

module.exports = {

	async exists(userID) {
		let u = (await $.col.users.find({"discord_id": userID}).toArray())[0];
		return u? true : false;
	},

	async create(userID) {
		let newUser = {
			"discord_id": userID,
			"achievements": [],
			"camping": 0,
			"credits": 200
		};

		await $.col.users.insertOne(newUser);
	}
}