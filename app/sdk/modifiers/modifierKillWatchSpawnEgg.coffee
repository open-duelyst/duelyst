CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierKillWatch = require './modifierKillWatch'
ModifierEgg = require './modifierEgg'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierKillWatchSpawnEgg extends ModifierKillWatch

  type:"ModifierKillWatchSpawnEgg"
  @type:"ModifierKillWatchSpawnEgg"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericSpawn"]

  cardDataOrIndexToSpawn: null
  minionName: null
  numSpawns: 0
  spawnPattern: null

  @createContextObject: (includeAllies=true, includeGenerals=true, cardDataOrIndexToSpawn, minionName, numSpawns, spawnPattern, options) ->
    contextObject = super(includeAllies, includeGenerals, options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.minionName = minionName
    contextObject.numSpawns = numSpawns
    contextObject.spawnPattern = spawnPattern
    return contextObject

  onKillWatch: (action) ->
    super(action)

    egg = {id: Cards.Faction5.Egg}
    egg.additionalInherentModifiersContextObjects ?= []
    egg.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(@cardDataOrIndexToSpawn, @minionName))

    position = action.getTargetPosition()
    cardToSpawn = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(egg)
    spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), position, @spawnPattern, cardToSpawn, @getCard(), @numSpawns)

    if spawnPositions?
      for spawnPosition in spawnPositions
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnPosition.x, spawnPosition.y, egg)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

module.exports = ModifierKillWatchSpawnEgg
