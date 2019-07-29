const $ = require("../globals");
const _ = require("./utils");


module.exports = {

	async do(userID, userName, args) {
		let elem = args.shift();
		switch(elem) {
			case "additem":
				return await addItem(args);
		}
	}

}

async function addItem(itemName) {
	let isStore = !(itemName.filter(i => i != "store")[0]);
	let item = {
		name: itemName.join(' '),
		store: isStore
	}

	

	return "Added new item" + isStore? " to the store" : "";
}