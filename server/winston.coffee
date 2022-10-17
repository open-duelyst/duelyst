os = require 'os'
winston = require 'winston'
Papertrail = require('winston-papertrail').Papertrail
config = require '../config/config.js'

setup = (systemName='n/a')->

  console.log("CONFIGURING WINSTON LOGS for #{config.get('env')}")

  # Winston Logger setup
  loggerTransports = []

  # file log
  # loggerTransports.push(new (winston.transports.File)(filename: "server/server.log"))

  # console log
  loggerTransports.push(
    new (winston.transports.Console)(
      level: config.get('winston_level')
      colorize: true
    )
  )

  # papertrail log
  loggerTransports.push(
    new Papertrail(
      host: 'logs.papertrailapp.com'
      port: 32677
      program: "#{config.get('env')}-#{systemName}"
      level: config.get('winston_level')
      colorize: true
      prettyPrint: true
      timestamp: false
      # Custom format to remove the log level from message
      logFormat: (level, message) ->
        return message
    )
  )
  # Winston Logger create
  logger = new (winston.Logger)(transports: loggerTransports)

  # console.log override
  # TODO : need better override method ?
  console.log = ->
    logger.info.apply(logger, arguments)
    return

  # console.log override
  # TODO : need better override method ?
  console.debug = ->
    logger.debug.apply(logger, arguments)
    return

  # console.log override
  # TODO : need better override method ?
  console.warn = ->
    logger.warn.apply(logger, arguments)
    return

  # console.log override
  # TODO : need better override method ?
  console.error = ->
    logger.error.apply(logger, arguments)
    return

module.exports = {
  setup:setup
}
