ModifierGrow = require './modifierGrow'
CardType = require 'app/sdk/cards/cardType'
ModifierGrowOnBothTurns = require './modifierGrowOnBothTurns'

class ModifierGrowPermanent extends ModifierGrow

  type:"ModifierGrowPermanent"
  @type:"ModifierGrowPermanent"

  fxResource: ["FX.Modifiers.ModifierGenericBuff", "FX.Modifiers.ModifierGrow"]

  # override standard Modifier method applyManagedModifiersFromModifiersContextObjects
  # in this case we want the applied buffs to be permanent even if the Grow Modifier
  # is removed later on
  applyManagedModifiersFromModifiersContextObjects: (modifiersContextObjects, card) ->
    if modifiersContextObjects? and card?
      for modifierContextObject in modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, card) # NOT being applied as a child modifier

module.exports = ModifierGrowPermanent
