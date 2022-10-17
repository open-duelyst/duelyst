ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
ModifierSilence = require './modifierSilence'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDispel extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDispel"
  @type:"ModifierTakeDamageWatchDispel"

  @modifierName:"Take Damage Watch"
  @description:"Dispel any minion that deals damage to this one"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch"]

  onDamageTaken: (action) ->
    super(action)

    # go back to closest source card that is a unit
    sourceCard = action.getSource()?.getAncestorCardOfType(CardType.Unit)

    # dispel any minion that damages this one
    if sourceCard? and !sourceCard.getIsGeneral()
      @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), sourceCard)

module.exports = ModifierTakeDamageWatchDispel
