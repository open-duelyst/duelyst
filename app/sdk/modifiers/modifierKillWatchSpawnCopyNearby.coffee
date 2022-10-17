CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierKillWatch = require './modifierKillWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Rarity = require 'app/sdk/cards/rarityLookup'

class ModifierKillWatchSpawnCopyNearby extends ModifierKillWatch

  type:"ModifierKillWatchSpawnCopyNearby"
  @type:"ModifierKillWatchSpawnCopyNearby"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericSpawn"]

  onKillWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      cardDataOrIndexToSpawn = action.getTarget().createNewCardData()
      cardToSpawn = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(cardDataOrIndexToSpawn)
      if !cardToSpawn.getWasGeneral()
        spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, cardToSpawn, @getCard(), 1)
        for spawnPosition in spawnPositions
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
          spawnAction.setSource(@getCard())
          @getGameSession().executeAction(spawnAction)

module.exports = ModifierKillWatchSpawnCopyNearby
