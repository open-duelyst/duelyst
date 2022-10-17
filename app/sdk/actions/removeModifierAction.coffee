Logger = require 'app/common/logger'
Action = require './action'

class RemoveModifierAction extends Action

  @type:"RemoveModifierAction"

  isDepthFirst: true # modifier actions should execute immediately
  modifierIndex: null # index of modifier to remove

  constructor: (gameSession, modifier) ->
    @type ?= RemoveModifierAction.type
    super(gameSession)
    @setModifier(modifier)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedModifier = null

    return p

  getLogName: () ->
    return super() + "_" + @getModifier()?.getLogName()

  setModifierIndex: (val) ->
    @modifierIndex = val

  getModifierIndex: () ->
    return @modifierIndex

  setModifier: (modifier) ->
    @setModifierIndex(modifier?.getIndex())

  getModifier: () ->
    if @modifierIndex?
      @_private.cachedModifier ?= @getGameSession().getModifierByIndex(@modifierIndex)
      return @_private.cachedModifier

  getTargetIndex:() ->
    return @getModifier()?.getCardAffectedIndex()

  getTarget: () ->
    if !@_private.target? and @modifierIndex?
      @_private.target = @getModifier()?.getCardAffected()
    return @_private.target

  getCard: @::getTarget

  _execute: () ->
    super()

    modifier = @getModifier()
    if modifier?
      #Logger.module("SDK").debug("#{@getGameSession().gameId} RemoveModifierAction._execute -> modifier #{modifier?.getLogName()}")
      # set modifier as removed by this action
      modifier.setRemovedByAction(@)

      # remove modifier
      @getGameSession().p_removeModifier(modifier)

module.exports = RemoveModifierAction
