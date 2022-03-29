

// Configuration object
var config = require('../config/config.js');
var Firebase = require('../node_modules/firebase');
var _ = require('underscore');

// Firebase secure token for duelyst-dev.firebaseio.com
var firebaseToken = require('../config/firebaseToken.js').firebaseToken

var duelystFB = new Firebase("https://duelyst-dev.firebaseio.com/");

if (process.argv[2]) {
	var userId = process.argv[2];
	var gameId = process.argv[3];
	duelystFB.auth(firebaseToken, function(error) {
		if (error) {

			console.log("error authenticating with FB: "+error);

		} else {

			duelystFB.child("job-queues").child("user-quest-update").push({playerId:userId,gameId:gameId});
		}
	});
} else {
	console.log("no user id provided");
}
