ModifierOpeningGambit = require './modifierOpeningGambit'
Modifier = require './modifier'
Races = require 'app/sdk/cards/racesLookup'

class ModifierOpeningGambitBuffSelfByBattlePetsHandStats extends ModifierOpeningGambit

  type: "ModifierOpeningGambitBuffSelfByBattlePetsHandStats"
  @type: "ModifierOpeningGambitBuffSelfByBattlePetsHandStats"

  @description: "Gain the combined Attack and Health of all Battle Pets in your action bar"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  onOpeningGambit: () ->
    super()
    healthBuff = 0
    attackBuff = 0
    for card in @getCard().getOwner().getDeck().getCardsInHandExcludingMissing()
      if card.getBelongsToTribe(Races.BattlePet)
        healthBuff += card.getMaxHP()
        attackBuff += card.getATK()
    buffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff, healthBuff)
    buffContextObject.appliedName = "Calculated Power"
    @getGameSession().applyModifierContextObject(buffContextObject, @getCard())

module.exports = ModifierOpeningGambitBuffSelfByBattlePetsHandStats
