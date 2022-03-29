

// Configuration object
var config = require('../config/config.js');
var Firebase = require('firebase');
var _ = require('underscore');

var fbRef = new Firebase(config.get('firebase'));
// Firebase secure token for duelyst-dev.firebaseio.com
var firebaseToken = config.get('firebaseToken');

console.log(config.get('firebase'));


fbRef.auth(firebaseToken, function(error) {
	if (error) {
		console.log("Error authenticating against our database.");
		process.exit(1);
	}
});

if (process.argv[2]) {
	var email = process.argv[2].replace('.',',');
	var action = process.argv[3];
	var amount = parseFloat(process.argv[4]);

	console.log("searching for user: "+email);
	fbRef.child("email-index").child(email).on("value",function(snapshot) {
		if (snapshot.val()) {
			console.log("found user "+snapshot.val());
			var questsRef = fbRef.child("user-quests").child(snapshot.val()).child("daily").child("current");
			questsRef.transaction(function(data){
				data = null
				return data;
			}, function(error,commited,snapshot) {
				if (error) {
					console.log("Error: transaction failed")
					process.exit(1);
				} else if (commited) {
					console.log("SUCCESS")
					process.exit(1);
				}

			});
		} else {
			console.log("no user with this email exists");
		}
	});

}
else {
	console.log("Error: no user email provided");
	process.exit(1);
}
