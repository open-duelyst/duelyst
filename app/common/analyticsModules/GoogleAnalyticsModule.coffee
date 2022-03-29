_ = require 'underscore'
AnalyticsEventPriority = require './analyticsEventPriority'

class GoogleAnalyticsModule

	@_moduleName = "GAModule"

	@minPriorityToReportEvent: AnalyticsEventPriority.Low

	@_deactivate: false
	@_throttleDelay: 1000

	@_customDimensionMapping:
		rank: "dimension1"
		registration_date: "dimension2"
		game_version: "dimension3" # Hit level dimension
		game_type: "dimension4" # Hit level dimension
		ltv: "dimension5" # Hit level dimension

	@_hitLevelDimensions: # Store of values for hit level dimensions
		game_version: undefined
		game_type: undefined

	@isActive: () ->
		if window.ga and !@_deactivate
			return true
		else
			return false

	@identify:(id,params) ->
		if id?
			window.ga('set', '&uid', id);

		for k,v of params
			if @_customDimensionMapping[k]
				window.ga('set', @_customDimensionMapping[k],v + "")

		# store any hit level dimensions values
		for k,v of @_hitLevelDimensions
			if params[k] != undefined
				@_hitLevelDimensions[k] = params[k]

	@page:(title,params) ->
		data = {}
		if !_.isUndefined(title)
			data.title = title

		if !_.isUndefined(params.path)
			data.page = params.path

		@_addHitLevelDimensionsToData(data)

		@_bufferedSend(['send', 'pageview',data])

	@screen:(title,params) ->
		data = {}
		if params.appName
			data.appName = params.appName
		else
			# appName is required for GA screen tracking
			return

		if !_.isUndefined(params.appId)
			data.appId = appId

		if !_.isUndefined(params.appVersion)
			data.appVersion = params.appVersion

		if !_.isUndefined(params.appInstallerId)
			data.appInstallerId = params.appInstallerId

		if !_.isUndefined(params.screenName)
			data.screenName = params.screenName

		@_addHitLevelDimensionsToData(data)

		@_bufferedSend(['send', 'screenview', data])

	@track:(eventName,params,trackOptions) ->
		data = {}
		data.hitType = 'event'
		if !_.isUndefined(params.category)
			data.eventCategory = params.category
		else
			# category is mandatory for GA
			return

		if !_.isUndefined(eventName)
			data.eventAction = eventName
		else
			# action is mandatory for GA
			return

		if trackOptions? and trackOptions.labelKey? and params[trackOptions.labelKey]?
			# Event Label must be a string
			data.eventLabel = params[trackOptions.labelKey] + ""

		# GA event values MUST be integers so do a round
		if trackOptions? and trackOptions.valueKey? and params[trackOptions.valueKey]?
			data.eventValue = Math.round(params.value)

		if trackOptions? and trackOptions.nonInteraction
			data.nonInteraction = 1

		@_addHitLevelDimensionsToData(data)

		@_bufferedSend(["send",data])

	@trackMonetizationEvent:(productSku,price) ->

		@.track("Purchase", {
			category: "Monetization",
			label: productSku,
			value: price # GA can only track integer values
		})

	@reset:() ->
		# noop

	@_buffer: []
	@_bufferedSend: (sendParams) ->
		@_buffer.push(sendParams)

		if @_buffer.length == 1
			setTimeout(@_sendLoop.bind(@),@_throttleDelay)

	@_sendLoop: () ->
		window.ga.apply(window.ga,@_buffer[0])
		@_buffer.shift()
		if @_buffer.length > 0
			setTimeout(@_sendLoop.bind(@),@_throttleDelay)

	# Injects the hit level custom dimensions into the send data
	@_addHitLevelDimensionsToData: (data) ->
		for k,v of @_hitLevelDimensions
			if @_hitLevelDimensions[k]?
				data[@_customDimensionMapping[k]] = @_hitLevelDimensions[k]



module.exports = GoogleAnalyticsModule;
