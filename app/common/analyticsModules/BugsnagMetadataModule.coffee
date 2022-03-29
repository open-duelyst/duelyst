_ = require 'underscore'
AnalyticsEventPriority = require './analyticsEventPriority'
CONFIG = require 'app/common/config'
exceptionReporter = require '@counterplay/exception-reporter'

class BugsnagMetadataModule

	@minPriorityToReportEvent: AnalyticsEventPriority.High
	@_deactivate: false

	@isActive: () ->
		if !@_deactivate
			return true
		else
			return false

	@page: (title, params) ->
		title = title or "/"
		exceptionReporter.leaveBreadcrumb("/page #{title}")

	@screen: (title, params) ->
		title = title or "untitled"
		exceptionReporter.leaveBreadcrumb("/screen #{title}")

	@track: (event, params) ->
		if params.nonInteraction
			return
		exceptionReporter.leaveBreadcrumb("/event #{event}")
	
	@identify: (id, params) ->
		# noop

	@reset: () ->
		# noop



module.exports = BugsnagMetadataModule;
