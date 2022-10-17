SDKObject = require './object'
_ = require 'underscore'
UtilsJavascript = require 'app/common/utils/utils_javascript'

class Step extends SDKObject

  action: null
  playerId:null
  timestamp: null
  index: null
  parentStepIndex: null
  childStepIndex: null
  transmitted: false

  constructor: (gameSession, playerId) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @playerId = playerId

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.includedRandomness = false # whether any action in this step included randomness during execution

    return p

  ###*
   * Returns the player id for the player that initiated this step.
   * @returns {Number}
   ###
  getPlayerId: () ->
    return @playerId

  ###*
   * Returns whether this step has been executed yet. This is not a safe way to check if this step is executing on the server, use GameSession.getIsRunningAsAuthoritative instead.
   * @returns {Boolean}
   ###
  isFirstTime: () ->
    return !@timestamp?

  ###*
   * Signs the step by setting its execution timestamp and index.
   ###
  addSignature: () ->
    if @isFirstTime()
      @timestamp = Date.now()

  ###*
   * Sets an index of order executed.
   * @param {Number|String}
   ###
  setIndex: (val) ->
    @index = val

  ###*
   * Returns an index of order executed.
   * @returns {Number}
   ###
  getIndex: () ->
    return @index

  ###*
   * Sets an index of the parent step.
   * @param {Step}
   ###
  setParentStep: (step) ->
    @parentStepIndex = step.getIndex()

  ###*
   * Returns an index of the parent step
   * @returns {Number}
   ###
  getParentStepIndex: () ->
    return @parentStepIndex

  ###*
   * Returns a parent step if present
   * @returns {Step|Null}
   ###
  getParentStep: () ->
    if @parentStepIndex?
      return @getGameSession().getStepByIndex(@parentStepIndex)

  ###*
   * Records a step as a child of this step.
   * @param {Step}
   ###
  setChildStep: (step) ->
    @childStepIndex = step.getIndex()

  ###*
   * Returns a the index the child step if one exists.
   * @returns {Number|String|null}
   ###
  getChildStepIndex: () ->
    return @childStepIndex

  ###*
   * Returns a list of child steps.
   * @returns {Step|null}
   ###
  getChildStep: () ->
    if @childStepIndex?
      return @getGameSession().getStepByIndex(@childStepIndex)

  ###*
   * Sets the explicit action that started this step.
   * @param {Action} action
   ###
  setAction: (action) ->
    @action = action

  ###*
   * Returns the explicit action that started this step.
   * @returns {Action}
   ###
  getAction: () ->
    return @action

  ###*
   * Sets whether this step included randomness at any point during its execution.
   * NOTE: only valid after execution and does not serialize!
   * @param {Boolean} val
   ###
  setIncludedRandomness: (val) ->
    @_private.includedRandomness = val

  ###*
   * Returns whether this step included randomness at any point during its execution.
   * NOTE: only valid after execution and does not serialize!
   * @returns {Boolean}
   ###
  getIncludedRandomness: () ->
    return @_private.includedRandomness

  ###*
   * Sets whether this step has been transmitted across the network yet.
   * @param {Boolean} transmitted
   ###
  setTransmitted: (transmitted) ->
    @transmitted = transmitted

  ###*
   * Returns whether this step has been transmitted across the network yet.
   * @returns {Boolean}
   ###
  getTransmitted: () ->
    return @transmitted

  ### JSON serialization ###

  deserialize: (data) ->
    UtilsJavascript.fastExtend(this,data)

module.exports = Step
