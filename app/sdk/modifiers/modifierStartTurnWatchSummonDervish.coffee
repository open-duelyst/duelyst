ModifierStartTurnWatchSpawnEntity = require './modifierStartTurnWatchSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'

i18next = require('i18next')

class ModifierStartTurnWatchSummonDervish extends ModifierStartTurnWatchSpawnEntity

  # This is pretty much just a wrapper for startTurnWatchSpawnEntity with a Dervish minion. The Obelysks'
  # description text was getting super long, so broke this part out into a keyworded modifier instead.

  type:"ModifierStartTurnWatchSummonDervish"
  @type:"ModifierStartTurnWatchSummonDervish"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.summon_dervish_def")

  @modifierName:i18next.t("modifiers.summon_dervish_name")
  @description:""

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: () ->
    contextObject = super({id: Cards.Faction3.Dervish})
    return contextObject

module.exports = ModifierStartTurnWatchSummonDervish
