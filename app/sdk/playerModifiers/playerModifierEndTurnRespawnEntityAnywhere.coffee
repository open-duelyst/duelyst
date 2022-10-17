PlayerModifier = require './playerModifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'

class PlayerModifierEndTurnRespawnEntityAnywhere extends PlayerModifier

  type:"PlayerModifierEndTurnRespawnEntityAnywhere"
  @type:"PlayerModifierEndTurnRespawnEntityAnywhere"

  @isHiddenToUI: true
  durationEndTurn: 1
  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onEndTurn: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @cardDataOrIndexToSpawn?
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.PATTERN_WHOLE_BOARD, card)
      if validSpawnLocations.length > 0
        spawnLocation = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getPlayer().getPlayerId(), spawnLocation.x, spawnLocation.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = PlayerModifierEndTurnRespawnEntityAnywhere
