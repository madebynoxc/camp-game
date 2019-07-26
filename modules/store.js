const $ = require("../globals");
const _ = require("./utils");

module.exports = {

	async do(userID, userName, args) {
		let elem = args.shift();
		switch(elem) {
			case "buy":
				return await buy(userID, args);
			case "sell":
				return await sell(userID, args);
			default:
				return await info();
		}
	}
}

async function info() {
	return "**!Welcome to the camp store!**";
}

async function buy(userID, args) {

}

async function sell(userID, args) {

}