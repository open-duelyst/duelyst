_ = require 'underscore'
Logger = require 'app/common/logger'
AnalyticsEventPriority = require './analyticsEventPriority'

class LoggerAnalyticsModule

  @_deactivate: true

  @isActive: () ->
    if !@_deactivate
      return true
    else
      return false

  @identify:(id,params) ->
    Logger.module("Analytics").log("identify() -> id: #{id}. params: #{JSON.stringify(params)}")

  @page:(title,params) ->
    Logger.module("Analytics").log("page() -> title: #{title}. params: #{JSON.stringify(params)}")

  @screen:(title,params) ->
    Logger.module("Analytics").log("screen() -> title: #{title}. params: #{JSON.stringify(params)}")

  @track:(eventName,params) ->
    Logger.module("Analytics").log("track() -> eventName: #{eventName}. params: #{JSON.stringify(params)}")

  @reset:() ->
    Logger.module("Analytics").log("reset().")


module.exports = LoggerAnalyticsModule
