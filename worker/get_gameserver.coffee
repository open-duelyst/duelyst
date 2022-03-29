config 		= require '../config/config.js'
Logger 		= require '../app/common/logger.coffee'
Colors 		= require 'colors'
Promise 	= require 'bluebird'
request 	= require 'superagent'
_ 			= require 'underscore'
Consul 		= require '../server/lib/consul'

# Returns a promise with the IP of game server if Consul enabled, other null
# Grabs a random active game server for list of available game servers
getGameServer = ()->
	if !config.get('consul.enabled')
		Logger.module("GAME CREATE").debug "Not assigning to specific server since no CONSUL in environment.".cyan
		return Promise.resolve(null)

	Consul.getHealthyServers()
	.then (servers) ->
		if servers.length == 0
			return Promise.reject(new Error("No servers available."))
		# Grab random node from available servers
		random_node = _.sample(servers)
		node_name = random_node["Node"]?["Node"]
		return Consul.kv.get("nodes/#{node_name}/dns_name")
		.then (dns_name) ->
			Logger.module("GAME CREATE").debug "Connecting players to #{dns_name}".green
			return dns_name

module.exports = getGameServer
