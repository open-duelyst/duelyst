CONFIG = require 'app/common/config'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ModifierBuilding = require './modifierBuilding'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class ModifierBuildCompleteReplicateAndSummonDervish extends ModifierBuilding

  type:"ModifierBuildCompleteReplicateAndSummonDervish"
  @type:"ModifierBuildCompleteReplicateAndSummonDervish"

  buildingMinion: null

  onBuildComplete: () ->
    super() # finish build

    if @getGameSession().getIsRunningAsAuthoritative()
      # and create another replicator obelysk
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@buildingMinion)
      spawnPositions = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, card)
      if spawnPositions?.length > 0
        obelyskSpawnPosition = spawnPositions.splice(@getGameSession().getRandomIntegerForExecution(spawnPositions.length), 1)[0]
        cardDataOrIndexToSpawn = @buildingMinion
        buildingModifier = ModifierBuildCompleteReplicateAndSummonDervish.createContextObject(@description, {id: Cards.Faction3.SimulacraObelysk}, 2)
        buildingModifier.buildingMinion = {id: Cards.Faction3.SimulacraBuilding}
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(buildingModifier)
        spawnAction1 = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), obelyskSpawnPosition.x, obelyskSpawnPosition.y, cardDataOrIndexToSpawn)
        spawnAction1.setSource(@getCard())
        @getGameSession().executeAction(spawnAction1)

      # and summon a dervish
      if spawnPositions?.length > 0
        dervish = @getGameSession().getExistingCardFromIndexOrCachedCardFromData({id: Cards.Faction3.Dervish})
        dervishSpawnPosition = spawnPositions[@getGameSession().getRandomIntegerForExecution(spawnPositions.length)]
        spawnAction2 = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), dervishSpawnPosition.x, dervishSpawnPosition.y, {id: Cards.Faction3.Dervish})
        spawnAction2.setSource(@getCard())
        @getGameSession().executeAction(spawnAction2)

module.exports = ModifierBuildCompleteReplicateAndSummonDervish
