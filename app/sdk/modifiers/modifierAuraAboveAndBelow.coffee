Modifier = require './modifier'
i18next = require 'i18next'

class ModifierAuraAboveAndBelow extends Modifier

  type: "ModifierAuraAboveAndBelow"
  @type: "ModifierAuraAboveAndBelow"

  fxResource: ["FX.Modifiers.ModifierAuraAboveAndBelow"]

  _findPotentialCardsInAura: () ->
    finalFilteredCards = []
    potentialCards = super()

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    generalPosition = general.getPosition()

    for card in potentialCards
      entityPosition = card.getPosition()
      if Math.abs(entityPosition.x - generalPosition.x) == 0 && Math.abs(entityPosition.y - generalPosition.y) <= 1
        finalFilteredCards.push(card)
    return finalFilteredCards

module.exports = ModifierAuraAboveAndBelow
