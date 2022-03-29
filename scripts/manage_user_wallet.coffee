
# Configuration object
config = require("../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../server/lib/users_module")
fbUtil = require '../app/common/utils/utils_firebase.js'

if process.argv[2]

	email = process.argv[2]
	action = process.argv[3]
	amount = parseFloat(process.argv[4])
	console.log "searching for user: " + email
	console.log "hash: " + fbUtil.escapeEmail(email)

	if not amount
		throw new Error("Error: no user amount provided")
		process.exit 1

	else
		UsersModule.userIdForEmail(email)
		.then (userId) ->
			if !userId
				throw new Error("userid not found")
			else
				console.log "found user ... #{action}ing #{amount}"
				switch action
					when "add"
						return UsersModule.addGoldToWallet(userId, amount)
					when "subtract"
						return UsersModule.addGoldToWallet(userId, -amount)
		.then (walletData) ->
			console.log "WALLET: all done..."
			console.log walletData
			process.exit(1)
		.catch (error) ->
			console.log(error)
			process.exit(1)

else
	throw new Error("no user email provided")
	process.exit(1)
