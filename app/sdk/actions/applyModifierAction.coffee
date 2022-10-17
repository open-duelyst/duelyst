Logger = require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action = require './action'
_ = require("underscore")

class ApplyModifierAction extends Action

  @type:"ApplyModifierAction"

  isDepthFirst: true # modifier actions should execute immediately
  modifierContextObject: null # context object that will create the modifier
  parentModifierIndex: null # index of modifier that applied or removed this modifier
  auraModifierId: null # identifier for which modifier in the parentModifier aura this is

  constructor: (gameSession, modifierContextObject, card, parentModifier=null, auraModifierId=null) ->
    @type ?= ApplyModifierAction.type
    super(gameSession)
    @setModifierContextObject(modifierContextObject)
    @setTarget(card)
    @setParentModifier(parentModifier)
    @setAuraModifierId(auraModifierId)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # cache
    p.cachedModifier = null
    p.cachedParentModifier = null

    return p

  getLogName: () ->
    return super() + "_" + @getModifier()?.getLogName()

  setModifierContextObject: (val) ->
    # copy data so we don't modify anything unintentionally
    if val? and _.isObject(val)
      @modifierContextObject = UtilsJavascript.fastExtend({}, val)
    else
      @modifierContextObject = val

  getModifierContextObject: () ->
    return @modifierContextObject

  getModifier: () ->
    if !@_private.cachedModifier?
      @_private.cachedModifier = @getGameSession().getOrCreateModifierFromContextObjectOrIndex(@modifierContextObject)
    return @_private.cachedModifier

  setParentModifierIndex: (val) ->
    @parentModifierIndex = val

  getParentModifierIndex: () ->
    return @parentModifierIndex

  setParentModifier: (parentModifier) ->
    @setParentModifierIndex(parentModifier?.getIndex())

  getParentModifier: () ->
    if !@_private.cachedParentModifier? and @parentModifierIndex?
      @_private.cachedParentModifier = @getGameSession().getModifierByIndex(@parentModifierIndex)
    return @_private.cachedParentModifier

  setAuraModifierId: (val) ->
    @auraModifierId = val

  getAuraModifierId: () ->
    return @auraModifierId

  getCard: @::getTarget

  _execute: () ->
    super()

    modifier = @getModifier()
    target = @getTarget()
    parentModifier = @getParentModifier()

    if modifier?
      #Logger.module("SDK").debug("#{@getGameSession().gameId} ApplyModifierAction._execute -> modifier #{modifier?.getLogName()} on #{target?.getLogName()} from parent modifier #{parentModifier?.getLogName()}")
      # regenerate context object so we transmit the correct values to the clients
      if @getGameSession().getIsRunningAsAuthoritative()
        # apply incoming card data before regenerating
        modifier.applyContextObject(@modifierContextObject)
        @modifierContextObject = modifier.createContextObject(@modifierContextObject)

        # flag data as applied locally so that we don't reapply regenerated data on server
        @modifierContextObject._hasBeenApplied = true

      # set modifier as applied by this action
      modifier.setAppliedByAction(@)

      # apply modifier
      @getGameSession().p_applyModifier(modifier, target, parentModifier, @modifierContextObject, @auraModifierId)

      # update context object post apply so we transmit the correct values to the clients
      if @getGameSession().getIsRunningAsAuthoritative() then @modifierContextObject = modifier.updateContextObjectPostApply(@modifierContextObject)

  scrubSensitiveData: (actionData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # transform modifier as needed
    modifier = @getModifier()
    if modifier? and modifier.isHideable(scrubFromPerspectiveOfPlayerId, forSpectator)
      hiddenModifier = modifier.createModifierToHideAs()
      actionData.modifierContextObject = hiddenModifier.createContextObject()
    return actionData

module.exports = ApplyModifierAction
