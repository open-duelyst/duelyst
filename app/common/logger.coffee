_ = require 'underscore'
moment = require 'moment'

# if process.env.RECORD_CLIENT_LOGS
#   ['log', 'debug', 'warn', 'error', 'info'].forEach((f)=>
#     oldFunction = console[f]
#     console[f] = ()->
#       record_args = Array.prototype.slice.call(arguments)
#       # record_args?.unshift(_name)
#       Logger.record(record_args)
#       oldFunction.apply(console,arguments)
#   )

class Logger

  # STATIC

  @_hue:0
  @_padLength:10
  @_modules:{}

  @enabled:true
  @isRecording:process.env.RECORD_CLIENT_LOGS
  @recordedBuffer:[]

  @startRecording:()->
    @isRecording = true
    @recordedBuffer = []
  @recordingFilter:() ->
    return true
  @record:()->
    args = _.map(arguments[0],(arg)-> return arg?.toString())
    if @recordingFilter(args)
      @recordedBuffer.push(args) if args[1] not instanceof Object
      if @recordedBuffer.length > 500
        @recordedBuffer.shift()

  @endRecording:()->
    @isRecording = false
    @recordedBuffer = []
    @recordingFilter = () ->
      return true

  @log:() ->
    @module("GLOBAL").log.apply(@,arguments)
  @debug:() ->
    @module("GLOBAL").debug.apply(@,arguments)
  @warn:() ->
    @module("GLOBAL").warn.apply(@,arguments)
  @error:() ->
    @module("GLOBAL").error.apply(@,arguments)
  @group:() ->
    @module("GLOBAL").group.apply(@,arguments)
  @groupEnd:() ->
    @module("GLOBAL").groupEnd.apply(@,arguments)

  @module:(name)->

    if !@enabled
      return {
        log:()->
        debug:()->
        error:()->
        warn:()->
        group:()->
        groupEnd:()->
        time:()->
        timeEnd:()->
      }

    if @_modules[name]
      return @_modules[name]

    _name = name
    _color = Logger.yieldColor()

    logfn = null
    modulePrefix = null
    modulePrefixColorString = "color: hsl(#{_color},99%,40%);"

    unless _name == "GLOBAL"
      modulePrefix = _name.slice(0, Logger._padLength)
      modulePrefix += Array(Logger._padLength + 3 - modulePrefix.length).join(' ') + '|'
      if (typeof window != 'undefined')
        modulePrefix = "%c"+modulePrefix
      else
        modulePrefix = Logger.terminalStylize(modulePrefix,Object.keys(@_modules).length)
        modulePrefixColorString = null

    if modulePrefix and modulePrefixColorString
      logfn = console.log.bind(console, modulePrefix, modulePrefixColorString)
      ['log', 'debug', 'warn', 'error', 'info'].forEach (f)->
        logFunction = console[f] || console['log']
        logfn[f] = logFunction.bind(console, modulePrefix, modulePrefixColorString)
    else
      logfn = console.log.bind(console, modulePrefix)
      ['log', 'debug', 'warn', 'error', 'info'].forEach (f)->
        logFunction = console[f] || console['log']
        logfn[f] = logFunction.bind(console, modulePrefix, moment().unix())

    ['group', 'groupEnd'].forEach (f)->
      if (console[f])
        logfn[f] = console[f].bind(console)
      else
        logfn[f] = ()->{}

    ['time', 'timeEnd'].forEach (f)->
      if (console[f])
        logfn[f] = (msg)-> console[f]("#{modulePrefix} #{msg}")
      else
        logfn[f] = ()->{}

    @_modules[name] = logfn

    # on the client side in production, wrap any of the log functions with a function that potentially routes logs to be recorded
    if typeof window != 'undefined' and process.env.RECORD_CLIENT_LOGS
      @_modules[name] = {}
      ['log', 'debug', 'warn', 'error', 'info'].forEach((f)=>
        @_modules[name][f] = ()->
          if Logger.isRecording
            record_args = Array.prototype.slice.call(arguments)
            record_args?.unshift(_name)
            Logger.record(record_args)
          logfn.apply(null, arguments)
      )
      ['group', 'groupEnd'].forEach((f)=>
        @_modules[name][f] = logfn[f]
      )

    # return the new logger module
    return @_modules[name]

  @yieldColor:()->
    goldenRatio = 0.618033988749895
    @_hue += goldenRatio
    @_hue = @_hue % 1
    return @_hue * 360

  @terminalStylize:(str, styleIndex)->

    styles =
      'blue'      : ['\x1B[34m', '\x1B[39m'],
      'cyan'      : ['\x1B[36m', '\x1B[39m'],
      'green'     : ['\x1B[32m', '\x1B[39m'],
      'magenta'   : ['\x1B[35m', '\x1B[39m'],
      'red'       : ['\x1B[31m', '\x1B[39m'],
      'yellow'    : ['\x1B[33m', '\x1B[39m']

    key = Object.keys(styles)[0]
    if (styleIndex < Object.keys(styles).length)
      key = Object.keys(styles)[styleIndex]

    return styles[key][0] + str + styles[key][1]


module.exports = Logger
