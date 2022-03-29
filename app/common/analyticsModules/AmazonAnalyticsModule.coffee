_ = require 'underscore'
AnalyticsEventPriority = require './analyticsEventPriority'
CONFIG = require 'app/common/config'
UtilsEnv = require 'app/common/utils/utils_env'
moment = require 'moment'

class AmazonAnalyticsModule

	@_moduleName = "AMAModule"

	@minPriorityToReportEvent: AnalyticsEventPriority.Optional

	@_deactivate: false

	@_mobileAnalyticsManager: null

	@initialized: false
	@_identifyAttributes: undefined # attributes to be added to every event
	@_identifyMetrics: undefined # metrics to be added to every event
	@_loggingEnabled: false


	@isActive: () ->
		if !@_deactivate && AWS? && AMA?
			return true
		else
			return false

	@initialize: () ->
		@initialized = true

		# Initialize AMA config
		AWS.config.region = 'us-east-1'
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: "us-east-1:56499b7e-9598-47d5-b005-87630e3a8ec4"
		})

		@_identifyAttributes = {}
		@_identifyMetrics = {}

	@_initializeAMAManager: () ->
		if @_mobileAnalyticsManager?
			console.error("Attempted to initialize AMA Manager when it already exists")
			return;

		if not @_identifyAttributes?.playerId?
			console.error("Attempted to initialize AMA Manager before a player id was set")
			return;

		appPackageName = "com.counterplay.duelyst"
		if window.isSteam
			appPackageName = "com.counterplay.duelyst_steam"
		else if window.isDesktop
			appPackageName = "com.counterplay.duelyst_client"
		else if window.isKongregate
			appPackageName = "com.counterplay.duelyst_kongregate"

		options = {
			appId : process.env.AMI_ID
			appTitle : "Duelyst " + process.env.NODE_ENV
			appVersionName : process.env.VERSION + ""
			sessionLength: 10 * 60 * 1000 # 10 minute session timeout (time until session expiration is checked)
			globalAttributes: @_identifyAttributes
			globalMetrics: @_identifyMetrics
			appPackageName: appPackageName
		}

		# False values expire session, true values extend session by session length
		# We always want to return true for the current session, this makes it so that session continues as long as they remain in client
		# It's possible for a session to enter localStorage and never become the current session so expire if session is not from today
		options.expirationCallback = (sessionData) ->
			sessionStartMoment = moment.utc(sessionData.startTimestamp)
			momentNow = moment.utc()
			if (sessionStartMoment.startOf('day').valueOf() != momentNow.startOf('day').valueOf())
				return false
			else
				return true


		# Uncomment to enable logging
		if UtilsEnv.getIsInDevelopment()
			options.logger = this

		@_mobileAnalyticsManager = new AMA.Manager(options)

		# Check if we want to renew session because a new day has started
		amaSession = @_mobileAnalyticsManager.outputs.session
		sessionStartMoment = moment.utc(amaSession.startTimestamp)
		momentNow = moment.utc()
		if (sessionStartMoment.startOf('day').valueOf() != momentNow.startOf('day').valueOf())
			# This session is on a new day, renew it
			@_mobileAnalyticsManager.renewSession()

		# Remove all but playerId from global fields
		@_mobileAnalyticsManager.options.globalAttributes = {playerId:@_identifyAttributes.playerId}
		@_mobileAnalyticsManager.options.globalMetrics = {}



	@identify:(id,params,utmParams) ->
		@_identifyAttributes = @_identifyAttributes || {}
		@_identifyMetrics = @_identifyMetrics || {}
		@_utmAttributes = @_utmAttributes || {}
		@_utmMetrics = @_utmMetrics || {}

		# Detect if we have identified as a new user
		if id != null && (id != @_identifyAttributes.playerId)
			# Check if this is a reidentify with a new user
			if @_identifyAttributes.playerId? and @_mobileAnalyticsManager?
				@_mobileAnalyticsManager.stopSession()

			@_identifyAttributes.playerId = id

			playerChanged = true

		# Translate identify data into attributes and metrics
		for k,v of params
			if _.isString(v)
				@_identifyAttributes[k] = v
			else if _.isNumber(v)
				@_identifyMetrics[k] = v
			else if _.isNull(v)
				delete @_identifyAttributes[k]
				delete @_identifyMetrics[k]

		# Translate identify data into attributes and metrics
		for k,v of utmParams
			if _.isString(v)
				@_utmAttributes[k] = v
			else if _.isNumber(v)
				@_utmMetrics[k] = v
			else if _.isNull(v)
				delete @_utmAttributes[k]
				delete @_utmMetrics[k]

		if playerChanged and not @_mobileAnalyticsManager?
			# Initialization automatically starts the session and handles global fields
			@_initializeAMAManager()
		else if playerChanged and @_mobileAnalyticsManager? # secondary boolean is redundant for clarity
			# If manager is already initialized we just have to manage the globals and start the session

			# Add all identify data to globals so they are tracked with start session
			@_mobileAnalyticsManager.options.globalAttributes =_.extend({},@_identifyAttributes,@_utmAttributes)
			@_mobileAnalyticsManager.options.globalMetrics = _.extend({},@_identifyMetrics,@_utmMetrics)

			@_mobileAnalyticsManager.startSession()

			# Remove all but playerId from globals
			@_mobileAnalyticsManager.options.globalAttributes = {playerId:id}
			@_mobileAnalyticsManager.options.globalMetrics = {}


	@page:(title,params) ->
		#noop

	@screen:(title,params) ->
		#noop

	@track:(eventName,params,trackOptions) ->
		# don't report data without a player id attached to it
		if !@_identifyAttributes?.playerId?
			return

		# This isn't super efficient
		attributes = _.extend({},@_identifyAttributes,@_extractAttributes(params))

		metrics = _.extend({},@_identifyMetrics,@_extractMetrics(params))

		if (trackOptions?.sendUTMData)
			attributes = _.extend(attributes,@_utmAttributes)
			metrics = _.extend(metrics,@_utmMetrics)

		if attributes.category?
			delete attributes.category

		@_mobileAnalyticsManager.recordEvent(eventName, attributes, metrics);

	@trackMonetizationEvent:(productSku,price,params) ->
		# don't report data without a player id attached to it
		if !@_identifyAttributes?.playerId?
			return

		attributes = _.extend({},@_identifyAttributes,@_utmAttributes,@_extractAttributes(params))

		metrics = _.extend({},@_identifyMetrics,@_utmMetrics,@_extractMetrics(params))

		@_mobileAnalyticsManager.recordMonetizationEvent(
        {
            productId : productSku,   	# Required e.g. 'My Example Product'
            price : price / 100,		# Required e.g. 1.99
            quantity : 1, 				# Required e.g. 1
            # currency : CURRENCY_CODE  # Optional ISO currency code e.g. 'USD'
        }, attributes, metrics);

	@_extractMetrics: (params) ->
		metrics = {}
		if params?
			for k,v of params
				key = k
				# For consistency with old data, translate value to eventValue
				if key == "value"
					key = "eventValue"
				# If it's a number treat it as a metric
				if _.isNumber(v)
					metrics[key] = Math.round(v)
		return metrics

	@_extractAttributes: (params) ->
		attributes = {}
		if params?
			for k,v of params
				# If the value is a string, treat it as an attribute
				if _.isString(v)
					attributes[k] = v
		return attributes

	@reset:() ->
		# noop


	@toggleLoggingEnabled: () ->
		@_loggingEnabled = !@_loggingEnabled

	#region logger methods
	@log: () ->
		if @_loggingEnabled
			console.log.apply(console,arguments)

	@info: () ->
		if @_loggingEnabled
			console.info.apply(console,arguments)

	@warn: () ->
		if @_loggingEnabled
			console.warn.apply(console,arguments)

	@error: () ->
		if @_loggingEnabled
			console.error.apply(console,arguments)

	#endregion logger methods



module.exports = AmazonAnalyticsModule;
