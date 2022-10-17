ModifierTakeDamageWatchSpawnEntity = require './modifierTakeDamageWatchSpawnEntity'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'

class ModifierTakeDamageWatchSpawnRandomBattlePet extends ModifierTakeDamageWatchSpawnEntity

  type:"ModifierTakeDamageWatchSpawnRandomBattlePet"
  @type:"ModifierTakeDamageWatchSpawnRandomBattlePet"

  @description:"Whenever this minion takes damage, summon a random Battle Pet nearby"

  getCardDataOrIndexToSpawn: () ->
    neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
    card = neutralBattlePetCards[@getGameSession().getRandomIntegerForExecution(neutralBattlePetCards.length)]
    return card.createNewCardData()

module.exports = ModifierTakeDamageWatchSpawnRandomBattlePet
