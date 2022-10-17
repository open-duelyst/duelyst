CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'

class ModifierOpponentSummonWatchSummonEgg extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchSummonEgg"
  @type:"ModifierOpponentSummonWatchSummonEgg"

  @modifierName:"Opponent Summon Watch Summon Egg"
  @description: "Whenever your opponent summons a minion, summon an egg."

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch"]

  cardDataOrIndexToSpawn: null
  eggName: null

  @createContextObject: (cardDataOrIndexToSpawn, eggName, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.eggName = eggName
    return contextObject

  onSummonWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, @getCard())
      if validSpawnLocations.length > 0
        spawnLocation = validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0]
        eggToSpawn = {id: Cards.Faction5.Egg}
        # add modifiers to card data
        eggToSpawn.additionalInherentModifiersContextObjects ?= []
        eggToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(@cardDataOrIndexToSpawn, @eggName))
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnLocation.x, spawnLocation.y, eggToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

module.exports = ModifierOpponentSummonWatchSummonEgg