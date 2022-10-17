ModifierTakeDamageWatchSpawnEntity = require './modifierTakeDamageWatchSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierTakeDamageWatchSpawnRandomHaunt extends ModifierTakeDamageWatchSpawnEntity

  type:"ModifierTakeDamageWatchSpawnRandomHaunt"
  @type:"ModifierTakeDamageWatchSpawnRandomHaunt"

  @description:"Whenever this minion takes damage, summon a random haunt nearby"

  possibleTokens: [
    {id: Cards.Boss.Boss31Haunt1 },
    {id: Cards.Boss.Boss31Haunt2 },
    {id: Cards.Boss.Boss31Haunt3 }
  ]

  getCardDataOrIndexToSpawn: () ->
    return @possibleTokens[@getGameSession().getRandomIntegerForExecution(@possibleTokens.length)]

module.exports = ModifierTakeDamageWatchSpawnRandomHaunt
