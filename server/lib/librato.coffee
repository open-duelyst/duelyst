librato = require 'librato-node'
config = require '../../config/config.js'
Logger = require '../../app/common/logger.coffee'

###
configure librato connection to track realtime ops metrics
###
if config.get('librato') and config.get('librato.token')
  librato.configure({email: config.get('librato.email'), token: config.get('librato.token'), period: 5000})
  librato.start()
	librato.on 'error', (err) ->
		Logger.module("LIBRATO").log err
  process.once 'SIGINT', () ->
    librato.stop() # stop optionally takes a callback

module.exports = librato
