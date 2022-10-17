_ = require 'underscore'
LoggerAnalyticsModule = require  'app/common/analyticsModules/loggerAnalyticsModule'
AnalyticsEventPriority = require 'app/common/analyticsModules/analyticsEventPriority'
AnalyticsEventCategory = require 'app/common/analyticsModules/analyticsEventCategory'

###
Tracking options:
  -labelKey: String key of value in event parameters to treat as event label
  -valueKey: String key of value in event parameters to treat as event value
  -sendUTMData: Boolean of whether or not to send utm data with event (assumed false)
  -nonInteraction: Boolean of whether or not this event is automated or stems from user interaction
The above are all optional
###


class Analytics

  @EventPriority: AnalyticsEventPriority
  @EventCategory: AnalyticsEventCategory
  # @_groupPriority - allows the user of a predefined priority for a group of hits,
  # set with @setGroupPriority, and always clear with @clearGroupPriority after group is complete
  @_groupPriority: undefined
  @_defaultPriority: AnalyticsEventPriority.High # The priority used for events tracked when there is no priority passed, or group priority set

  @_getAnalyticsModules:() ->
    analyticsModules = []

    if LoggerAnalyticsModule.isActive()
      analyticsModules.push(LoggerAnalyticsModule)

    return analyticsModules


  @identify:(id,params,utmParams) ->
    for module in @_getAnalyticsModules()
      if module.identify != undefined
        module.identify(id,params,utmParams)

  @page:(title,params) ->
    for module in @_getAnalyticsModules()
      if module.page != undefined
        module.page(title,params)

  @screen:(title,params) ->
    for module in @_getAnalyticsModules()
      if module.screen != undefined
        module.screen(title, params)

  ###*
  # Completes a challenge for a user and unlocks any rewards !if! it's not already completed
  # @public
  # @param  {String}  eventName        Name of event to be tracked
  # @param  {Object}  params          Context data of event being tracked (per event metrics and attributes) (optional)
  # @param  {Object}  trackOptions    Contains options for how to be tracked, SEE TOP OF FILE FOR DEFINITIONS (optional)
  # @param  {EventPriority}  priority  Priority of event, used to filter which modules receive this event, defaults to Analytics._defaultPriority (optional)
  # @return  No returned value
  ###
  @track:(eventName,params,trackOptions, priority) ->
    # Uses passed in priority, if none passed uses set group priority, if no group priority uses default priority
    if _.isUndefined(priority)
      priority = @_defaultPriority
      if !_.isUndefined(@_groupPriority)
        priority = @_groupPriority

    for module in @_getAnalyticsModules()
      if module.track != undefined
        # Check priority filter
        if _.isUndefined(module.minPriorityToReportEvent) or priority >= module.minPriorityToReportEvent
          module.track(eventName,params,trackOptions)

  @trackMonetizationEvent:(productSku,price, priority) ->

    # Uses passed in priority, if none passed uses set group priority, if no group priority uses default priority
    if _.isUndefined(priority)
      priority = @_defaultPriority
      if !_.isUndefined(@_groupPriority)
        priority = @_groupPriority

    for module in @_getAnalyticsModules()
      if module.trackMonetizationEvent != undefined
        # Check priority filter
        if _.isUndefined(module.minPriorityToReportEvent) or priority >= module.minPriorityToReportEvent
          module.trackMonetizationEvent(productSku,price)

  @reset:() ->
    for module in @_getAnalyticsModules()
      if module.reset != undefined
        module.reset()

  @setGroupPriority: (groupPriority) ->
    @_groupPriority = groupPriority

  @clearGroupPriority: () ->
    @_groupPriority = undefined

  # Toggles each modules logging if logging is enableable
  @toggleLoggingEnabled: () ->
    for module in @_getAnalyticsModules()
      if module.toggleLoggingEnabled != undefined
        module.toggleLoggingEnabled()

module.exports = Analytics
