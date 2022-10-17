CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Modifier = require './modifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOnRemoveSpawnEntities extends Modifier

  type:"ModifierOnRemoveSpawnEntities"
  @type:"ModifierOnRemoveSpawnEntities"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false

  numSpawns: 0
  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, numSpawns, options) ->
    contextObject = super(options)
    contextObject.numSpawns = numSpawns
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onRemoveFromCard: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()
      cardToSpawn = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, cardToSpawn, @getCard(), @numSpawns)
      for spawnPosition in spawnPositions
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnPosition.x, spawnPosition.y, @cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

    super(action)

module.exports = ModifierOnRemoveSpawnEntities
