config     = require '../config/config.js'
Logger     = require '../app/common/logger.coffee'
Colors     = require 'colors'
Promise   = require 'bluebird'
request   = require 'superagent'
Consul     = require '../server/lib/consul'
CustomError = require '../server/lib/custom_errors.coffee'

isMatchmakingActiveAsync = () ->
  if !config.get('consul.enabled')
    Logger.module("GAME CREATE").debug "No need to check matchmaking stack status since no CONSUL in environment.".cyan
    return Promise.resolve(true)

  Consul.kv.get("environments/#{process.env.NODE_ENV}/matchmaking-status.json")
  .then JSON.parse
  .then (matchmakingStatus) ->
    # matchmakingEnabled is currently a string
    if matchmakingStatus.enabled
      Logger.module("GAME CREATE").debug "Matchmaking status is active".cyan
      return true
    else
      Logger.module("GAME CREATE").debug "Matchmaking status is inactive".red
      return Promise.reject(new CustomError.MatchmakingOfflineError("Matchmaking is currently offline, please retry shortly."))

module.exports = isMatchmakingActiveAsync
