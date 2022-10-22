Promise = require 'bluebird'
#_ = require 'underscore'

config = require '../config/config.js'
Logger = require '../app/common/logger.coffee'
#Consul = require '../server/lib/consul'

getGameServer = ()->
  # Consul flow (disabled).
  ###
  # Grabs a random active game server for list of available game servers
  if config.get('consul.enabled')
    Consul.getHealthyServers()
    .then (servers) ->
      if servers.length == 0
        return Promise.reject(new Error("No servers available."))
      # Grab random node from available servers
      random_node = _.sample(servers)
      node_name = random_node["Node"]?["Node"]
      return Consul.kv.get("nodes/#{node_name}/dns_name")
      .then (dns_name) ->
        Logger.module("GAME CREATE").debug "Connecting players to #{dns_name}"
        return dns_name
  ###

  # Return a domain name in staging and production.
  # TODO: Rework this if we scale beyond one game server.
  if ['production', 'staging'].includes(config.get('env'))
    server = config.get('matchmaking.defaultGameServer')
    Logger.module('GAME').log "Assigning user to game server #{server}"
    return Promise.resolve(server)

  # Return null in development (defaults to window.location.hostname).
  Logger.module('GAME').log 'Not assigning game server for dev environment'
  return Promise.resolve(null)

module.exports = getGameServer
