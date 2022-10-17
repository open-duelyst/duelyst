CONFIG = require 'app/common/config'
ModifierSynergize = require './modifierSynergize'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierSynergizeSummonMinionNearGeneral extends ModifierSynergize

  type:"ModifierSynergizeSummonMinionNearGeneral"
  @type:"ModifierSynergizeSummonMinionNearGeneral"

  @description:"Blood Surge: Summon an entity nearby your General"

  cardDataOrIndexToSpawn: null
  spawnCount: 1

  @createContextObject: (cardDataOrIndexToSpawn, spawnCount=1, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnCount = spawnCount
    return contextObject

  onSynergize: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), general.getPosition(), CONFIG.PATTERN_3x3, card, @getCard(), 8)
      for i in [0...@spawnCount]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierSynergizeSummonMinionNearGeneral
