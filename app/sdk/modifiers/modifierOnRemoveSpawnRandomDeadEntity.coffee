CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Modifier = require './modifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOnRemoveSpawnRandomDeadEntity extends Modifier

  type:"ModifierOnRemoveSpawnRandomDeadEntity"
  @type:"ModifierOnRemoveSpawnRandomDeadEntity"

  @modifierName:"ModifierOnRemoveSpawnRandomDeadEntity"
  @description: "When this artifact breaks, summon the last friendly minion destroyed this game nearby"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  onRemoveFromCard: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, @getCard())
      if validSpawnLocations.length > 0
        spawnPosition = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]
        deadUnits = @getGameSession().getDeadUnits(@getCard().getOwnerId())
        if deadUnits.length > 0
          cardDataOrIndexToSpawn = deadUnits[@getGameSession().getRandomIntegerForExecution(deadUnits.length)].createNewCardData()
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
          spawnAction.setSource(@getCard())
          @getGameSession().executeAction(spawnAction)

    super(action)


module.exports = ModifierOnRemoveSpawnRandomDeadEntity
