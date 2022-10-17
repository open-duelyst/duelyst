Action = require 'app/sdk/actions/action'

###
  Action used for modifiers.
###
class ModifierAction extends Action

  @type: "ModifierAction"
  type: "ModifierAction"
  _modifier: null
  modifierIndex: null
  _parentModifier: null
  parentModifierIndex: null

  constructor: (gameSession, modifier) ->
    super(gameSession)
    @setModifier(modifier)

  getLogName: ()->
    return super() + "_#{@getModifier()?.getLogName()}"

  setModifier: (modifier) ->
    if modifier?
      @modifierIndex = modifier.getIndex()

      # TODO: stop extracting card from modifier
      card = modifier.getCardAffected()
      @setOwnerId(card?.getOwnerId())
      @setSource(card)
      @setTarget(card)

  getModifierIndex: () ->
    return @modifierIndex

  getModifier: () ->
    @_modifier ?= @getGameSession().getModifierByIndex(@modifierIndex)
    return @_modifier

  setParentModifier: (parentModifier) ->
    if parentModifier?
      @parentModifierIndex = parentModifier.getIndex()

  getParentModifierIndex: () ->
    return @parentModifierIndex

  getParentModifier: () ->
    @_parentModifier ?= @getGameSession().getModifierByIndex(@parentModifierIndex)
    return @_parentModifier

module.exports = ModifierAction
