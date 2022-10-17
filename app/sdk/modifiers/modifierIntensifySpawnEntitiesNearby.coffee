ModifierIntensify = require './modifierIntensify'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class ModifierIntensifySpawnEntitiesNearby extends ModifierIntensify

  type: "ModifierIntensifySpawnEntitiesNearby"
  @type: "ModifierIntensifySpawnEntitiesNearby"

  cardDataOrIndexToSpawn: 0
  numToSpawn: 1

  @createContextObject: (cardDataOrIndexToSpawn, numToSpawn=1, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.numToSpawn = numToSpawn
    return contextObject

  onIntensify: () ->

    if @getGameSession().getIsRunningAsAuthoritative() and @cardDataOrIndexToSpawn?

      totalNumberToSpawn = @numToSpawn * @getIntensifyAmount()
      card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, card, @, totalNumberToSpawn)

      for location in spawnLocations
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), location.x, location.y, @cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

module.exports = ModifierIntensifySpawnEntitiesNearby
