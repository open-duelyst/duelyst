Modifier = require './modifier'
ModifierDynamicCountModifySelf = require './modifierDynamicCountModifySelf'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'

class ModifierDynamicCountModifySelfByShadowTilesOnBoard extends ModifierDynamicCountModifySelf

  type:"ModifierDynamicCountModifySelfByShadowTilesOnBoard"
  @type:"ModifierDynamicCountModifySelfByShadowTilesOnBoard"

  @description:"This minion has %X for each friendly Shadow Creep"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (attackBuff = 0, maxHPBuff = 0, description, appliedName, options = undefined) ->
    contextObject = super(options)
    perTileStatBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    if appliedName
      perTileStatBuffContextObject.appliedName = appliedName
    contextObject.description = description
    contextObject.modifiersContextObjects = [perTileStatBuffContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description.replace /%X/, modifierContextObject.description

  getCurrentCount: () ->
    shadowTileCount = 0
    for card in @getGameSession().getBoard().getCards(CardType.Tile, allowUntargetable=true)
      if card.getBaseCardId() is Cards.Tile.Shadow and card.isOwnedBy(@getCard().getOwner())
        shadowTileCount++
    return shadowTileCount

module.exports = ModifierDynamicCountModifySelfByShadowTilesOnBoard
