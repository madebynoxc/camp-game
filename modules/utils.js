module.exports = {
	colors: {
	    red: 14356753,
	    yellow: 16756480,
	    green: 1030733,
	    blue: 1420012,
	    grey: 3553598,
	    default: 2067276
	},

	embed(color, message, title) {
		return { 
			title: title,
			description: message,
			color: color
		};
	},

	f(user, msg) {
		return `**${user}**, ${msg}`;
	},

	getDrain(dateStart) {
		let diff = new Date() - dateStart;
		return diff * .0000001;
	},

	timeLeft(tg) {
	    let mil = tg - new Date();
	    return msToTime(mil);
	}
}

function msToTime(s) {

	  function pad(n, z) {
	    z = z || 2;
	    return ('00' + n).slice(-z);
	  }

	  var ms = s % 1000;
	  s = (s - ms) / 1000;
	  var secs = s % 60;
	  s = (s - secs) / 60;
	  var mins = s % 60;
	  var hrs = (s - mins) / 60;

	  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}