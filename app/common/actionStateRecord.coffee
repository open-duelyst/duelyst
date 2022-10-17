CONFIG = require 'app/common/config'
Logger = require 'app/common/logger'
EVENTS = require 'app/common/event_types'

_ = require 'underscore'

###*
 * Helper object that can attach to any event stream and record specific state for in response to any action event.
 * NOTE: Do not serialize this object.
 * @example
 * var actionStateRecord = new ActionStateRecord()
 * actionStateRecord.startListeningToEvents(gameSession.getEventBus())
 * actionStateRecord.setupToRecordStateOnEvent(EVENTS.action, { "remainingMana" : function () { return player.getRemainingMana(); } })
 ###
class ActionStateRecord

  _currentState: null
  _currentStateByType: null
  _actionIndicesRecorded: null
  _actionIndicesRecordedByEventType: null
  _lastActionIndicesRecordedCache: null
  _lastActionIndicesRecordedByEventTypeCache: null
  _propertyNamesToRecordByEventType: null
  _currentPropertyNamesToRecord: null
  _recordingMethodsByEventType: null
  _currentRecordingMethods: null
  _stateByActionIndex: null
  _stateByActionIndexAndEventType: null
  _eventBus: null
  _listeningToEvents: false

  # region INITIALIZE

  constructor: () ->
    @_listeningToEvents = false
    @_propertyNamesToRecordByEventType = {}
    @_currentPropertyNamesToRecord = []
    @_recordingMethodsByEventType = {}
    @_currentRecordingMethods = {}
    @_actionIndicesRecorded = []
    @_actionIndicesRecordedByEventType = {}
    @_lastActionIndicesRecordedCache = {}
    @_lastActionIndicesRecordedByEventTypeCache = {}
    @_stateByActionIndex = {}
    @_currentState = {}
    @_currentStateByType = {}
    @_stateByActionIndexAndEventType = {}

  # endregion INITIALIZE

  # region GETTERS / SETTERS

  ###*
   * Returns the current state.
   * @returns {Object} state object with all recorded properties
   ###
  getCurrentState: () ->
    return @_currentState

  ###*
   * Returns the current state for an event type.
   * @returns {Object} state object with all recorded properties
   ###
  getCurrentStateForEventType: (eventType) ->
    return (eventType? && @_currentStateByType[eventType]) || @getCurrentState()

  ###*
   * Returns the state at an action given an index, or if no action passed then the last recorded current state.
   * @param {Action} action action to get the state at
   * @returns {Object} state object with all recorded properties at action
   ###
  getStateAtAction: (action) ->
    return (action? && (@_stateByActionIndex[action.getIndex()] || @_stateByActionIndex[@_getLastActionIndexRecordedAtOrBeforeActionIndex(action.getIndex())])) || @getCurrentState()

  ###*
   * Returns the state at an action given an index and an event type, or if no event type passed gets state at action.
   * @param {Action} action action to get the state at
   * @param {String} eventType event type to get the state at
   * @returns {Object} state object with all recorded properties at action
   ###
  getStateAtActionForEventType: (action, eventType) ->
    return (action? && eventType? && @_stateByActionIndexAndEventType[@_getStateIndexForEventType(@_getLastActionIndexRecordedAtOrBeforeActionIndexForEventType(action.getIndex(), eventType), eventType)]) || @getStateAtAction(action)

  _getStateIndexForEventType: (actionIndex, eventType) ->
    return actionIndex + "_" + eventType

  _getLastActionIndexRecorded: () ->
    if @_actionIndicesRecorded.length == 0
      return -1
    else
      return @_actionIndicesRecorded[@_actionIndicesRecorded.length - 1]

  _getLastActionIndexRecordedForEventType: (eventType) ->
    actionIndicesRecorded = @_actionIndicesRecordedByEventType[eventType]
    if actionIndicesRecorded.length == 0
      return -1
    else
      return actionIndicesRecorded[actionIndicesRecorded.length - 1]

  _getLastActionIndexRecordedAtOrBeforeActionIndex: (actionIndex) ->
    # attempt to use cached index
    lastIndex = @_lastActionIndicesRecordedCache[actionIndex]
    if !lastIndex?
      # find last index
      lastIndex = -1
      for index in @_actionIndicesRecorded by -1
        if index <= actionIndex
          lastIndex = @_lastActionIndicesRecordedCache[actionIndex] = index
          break
    return lastIndex

  _getLastActionIndexRecordedAtOrBeforeActionIndexForEventType: (actionIndex, eventType) ->
    # attempt to use cached index
    stateIndex = @_getStateIndexForEventType(actionIndex, eventType)
    lastIndex = @_lastActionIndicesRecordedByEventTypeCache[stateIndex]
    if !lastIndex?
      # find last index
      lastIndex = -1
      actionIndicesRecorded = @_actionIndicesRecordedByEventType[eventType]
      if actionIndicesRecorded? and actionIndicesRecorded.length > 0
        for index in actionIndicesRecorded by -1
          if index <= actionIndex
            lastIndex = @_lastActionIndicesRecordedByEventTypeCache[stateIndex] = index
            break
    return lastIndex

  getHasRecordedStateForActions: () ->
    return @_getLastActionIndexRecorded() != -1

  # endregion GETTERS / SETTERS

  # region EVENT STREAM

  getIsListeningToEvents: () ->
    return @_listeningToEvents

  startListeningToEvents: (eventBus) ->
    # stop listening to previous if changing eventBus
    if @_eventBus != eventBus
      @stopListeningToEvents()

    if !@_listeningToEvents and eventBus?
      @_listeningToEvents = true
      @_eventBus = eventBus

      # deserialize listener
      @_eventBus.on(EVENTS.deserialize, @recordStateAtLastActionRecorded, @)

      # listeners for events
      eventTypes = Object.keys(@_propertyNamesToRecordByEventType)
      if eventTypes.length > 0
        for eventType in eventTypes
          @_eventBus.on(eventType, @onStateRecordingActionEvent, @)

  stopListeningToEvents: () ->
    if @_listeningToEvents
      @_listeningToEvents = false

      if @_eventBus?
        # deserialize listener
        @_eventBus.off(EVENTS.deserialize, @recordStateAtLastActionRecorded, @)

        # listeners for events
        eventTypes = Object.keys(@_propertyNamesToRecordByEventType)
        if eventTypes.length > 0
          for eventType in eventTypes
            @_eventBus.off(eventType, @onStateRecordingActionEvent, @)

        @_eventBus = null

  # endregion EVENT STREAM

  # region STATE

  ###*
   * Starts recording properties of a target each time a specific event occurs.
   * @param {String} eventType type of event to record state
   * @param {*} stateTarget object to record state from
   * @param {Object} propertiesToRecord map of names of properties to record to function to use to record
   * @example
   * # record player's remaining mana on every action event using the player's getRemainingMana method
   * actionStateRecord.setupToRecordStateOnEvent(EVENTS.action, { "remainingMana" : player.getRemainingMana.bind(player) })
   ###
  setupToRecordStateOnEvent: (eventType, propertiesToRecord) ->
    if eventType? and !@_propertyNamesToRecordByEventType[eventType]?
      #Logger.module("COMMON").log("ActionStateRecord.recordCurrentState", eventType)
      propertyNamesToRecord = Object.keys(propertiesToRecord)
      recordingMethods = {}
      for propertyName in propertyNamesToRecord
        recordingMethods[propertyName] = propertiesToRecord[propertyName]
      if !@_propertyNamesToRecordByEventType[eventType]?
        # new event type
        @_propertyNamesToRecordByEventType[eventType] = propertyNamesToRecord
        @_recordingMethodsByEventType[eventType] = recordingMethods

        if @_eventBus?
          @_eventBus.on(eventType, @onStateRecordingActionEvent, @)
      else
        # merge properties into properties recorded for event type
        @_propertyNamesToRecordByEventType[eventType] = _.union(@_propertyNamesToRecordByEventType[eventType], propertyNamesToRecord)
        @_recordingMethodsByEventType[eventType] = _.extend(@_recordingMethodsByEventType[eventType], recordingMethods)

      # add properties to master list of properties recorded
      @_currentPropertyNamesToRecord = _.union(@_currentPropertyNamesToRecord, propertyNamesToRecord)
      @_currentRecordingMethods = _.extend(@_currentRecordingMethods, recordingMethods)

      # reset list of action indices recorded for this event type
      @_actionIndicesRecordedByEventType[eventType] = []

      # record current state
      @_recordProperties(eventType, @_getLastActionIndexRecorded())

  ###*
   * Tears down the recording of all properties for all event types and deletes all property recording methods, but retains the current state. Effectively undoes all calls to setupToRecordStateOnEvent.
   ###
  teardownRecordingStateOnAllEvents: () ->
    eventTypes = Object.keys(@_propertyNamesToRecordByEventType)
    if eventTypes.length > 0
      for eventType in eventTypes
        if @_eventBus?
          @_eventBus.off(eventType, @onStateRecordingActionEvent, @)
        delete @_propertyNamesToRecordByEventType[eventType]
        delete @_recordingMethodsByEventType[eventType]
      @_currentPropertyNamesToRecord = {}
      @_currentRecordingMethods = {}

  ###
   * Records action state for all event types at a given action index, or last action index recorded if none provided.
   * @param {String|Number} [actionIndex=last recorded] action index to record state at
  ###
  recordStateEvenIfNotChanged: (actionIndex) ->
    # fallback to index of last action recorded
    actionIndex ?= @_getLastActionIndexRecorded()

    # ignore changed
    ignoreChanged = true

    # record for each event type
    eventTypes = Object.keys(@_propertyNamesToRecordByEventType)
    for eventType in eventTypes
      @_recordProperties(eventType, actionIndex, ignoreChanged)

  ###
   * Records action state for all event types at the last action index recorded.
  ###
  recordStateAtLastActionRecorded: () ->
    # record for each event type
    actionIndex = @_getLastActionIndexRecorded()
    eventTypes = Object.keys(@_propertyNamesToRecordByEventType)
    for eventType in eventTypes
      @_recordProperties(eventType, actionIndex)

  ###
   * Records all properties for a given event type at an action index, and optionally forces the record to ignore whether the values have changed.
   * @private
  ###
  _recordProperties: (eventType, actionIndex, ignoreChanged=false) ->
    if eventType?
      propertyNamesToRecord = @_propertyNamesToRecordByEventType[eventType]
      recordingMethods = @_recordingMethodsByEventType[eventType]
    else
      propertyNamesToRecord = @_currentPropertyNamesToRecord
      recordingMethods = @_currentRecordingMethods
    #Logger.module("COMMON").log("ActionStateRecord.recordCurrentState", eventType, propertyNamesToRecord, recordingMethods)

    # record each property
    propertyRecorded = false
    stateRecord = {}
    for propertyName in propertyNamesToRecord
      # get property value by recording method
      recordingMethod = recordingMethods[propertyName]
      value = recordingMethod()
      #Logger.module("COMMON").log(" > recorded", propertyName, " === ", value, " using", recordingMethod)

      # property value cannot be null/undefined
      if value?
        propertyRecorded = true
        stateRecord[propertyName] = value
        @_currentState[propertyName] = value

    if propertyRecorded
      changed = true

      if eventType?
        # record new current state for this event type if changed
        changed = ignoreChanged or !_.isEqual(@_currentStateByType[eventType], stateRecord)
        if changed
          @_currentStateByType[eventType] = stateRecord
          if actionIndex?
            stateIndex = this._getStateIndexForEventType(actionIndex, eventType)
            actionIndicesRecorded = @_actionIndicesRecordedByEventType[eventType]
            if actionIndicesRecorded.length == 0 or actionIndicesRecorded[actionIndicesRecorded.length - 1] != actionIndex
              actionIndicesRecorded.push(actionIndex)
            @_stateByActionIndexAndEventType[stateIndex] = stateRecord

      # record new current state
      if changed
        if actionIndex?
          newStateRecord = _.extend({}, @_currentState)
          if @_actionIndicesRecorded.length == 0 or @_actionIndicesRecorded[@_actionIndicesRecorded.length - 1] != actionIndex
            @_actionIndicesRecorded.push(actionIndex)
          @_stateByActionIndex[actionIndex] = newStateRecord

  # endregion STATE

  # region EVENTS

  onStateRecordingActionEvent: (event) ->
    # use event action index
    if event?
      actionIndex = event.action?.getIndex()
      eventType = event.type

    # fallback to index of last action recorded
    actionIndex ?= @_getLastActionIndexRecorded()

    if actionIndex?
      #Logger.module("COMMON").log("ActionStateRecord.onStateRecordingActionEvent", eventType, "with action", event?.action?.getLogName())
      @_recordProperties(eventType, actionIndex)

  # endregion EVENTS

module.exports = ActionStateRecord
