SpellApplyModifiersToUnitsInHand = require './spellApplyModifiersToUnitsInHand'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'

class SpellShadowWaltz extends SpellApplyModifiersToUnitsInHand

  getCardsAffected: () ->
    potentialCards = super()
    finalCards = []
    for card in potentialCards
      if card? and card.hasModifierType(ModifierBackstab.type)
        finalCards.push(card)

    return finalCards

module.exports = SpellShadowWaltz
