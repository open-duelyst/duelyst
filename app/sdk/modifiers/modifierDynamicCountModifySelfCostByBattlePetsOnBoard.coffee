ModifierDynamicCountModifySelf = require './modifierDynamicCountModifySelf'
ModifierManaCostChange = require './modifierManaCostChange'
Races = require 'app/sdk/cards/racesLookup'
CardType = require 'app/sdk/cards/cardType'

class ModifierDynamicCountModifySelfCostByBattlePetsOnBoard extends ModifierDynamicCountModifySelf

  type:"ModifierDynamicCountModifySelfCostByBattlePetsOnBoard"
  @type:"ModifierDynamicCountModifySelfCostByBattlePetsOnBoard"

  @description:"Costs %X for each friendly Battle Pet on the field"

  activeInDeck: false
  activeInHand: true
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (manaCostChange=0, description, appliedName, options = undefined) ->
    contextObject = super(options)
    perPetCostChangeBuff = ModifierManaCostChange.createContextObject(manaCostChange)
    if appliedName
      perPetCostChangeBuff.appliedName = appliedName
    contextObject.description = description
    contextObject.modifiersContextObjects = [perPetCostChangeBuff]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description.replace /%X/, modifierContextObject.description

  getCurrentCount: () ->
    battlePetCount = 0
    for card in @getGameSession().getBoard().getCards(CardType.Unit)
      if card.getOwnerId() is @getCard().getOwnerId() and card.getBelongsToTribe(Races.BattlePet)
        battlePetCount++
    return battlePetCount

module.exports = ModifierDynamicCountModifySelfCostByBattlePetsOnBoard
