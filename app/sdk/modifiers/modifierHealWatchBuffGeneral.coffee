Modifier = require './modifier'
ModifierHealWatch = require './modifierHealWatch'
CardType = require 'app/sdk/cards/cardType'

class ModifierHealWatchBuffGeneral extends ModifierHealWatch

  type:"ModifierHealWatchBuffGeneral"
  @type:"ModifierHealWatchBuffGeneral"

  @modifierName:"Heal Watch"
  @description: "Whenever anything is healed, give your General %X"

  fxResource: ["FX.Modifiers.ModifierHealWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onHealWatch: (action) ->
    general = @getGameSession().getGeneralForPlayer(@getCard().getOwner())
    for modifierContextObject in @modifiersContextObjects
      @getGameSession().applyModifierContextObject(modifierContextObject, general)

module.exports = ModifierHealWatchBuffGeneral
