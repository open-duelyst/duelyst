ModifierMyGeneralAttackWatch = require './modifierMyGeneralAttackWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class ModifierMyGeneralAttackWatchSpawnEntity extends ModifierMyGeneralAttackWatch

  type:"ModifierMyGeneralAttackWatchSpawnEntity"
  @type:"ModifierMyGeneralAttackWatchSpawnEntity"

  @modifierName:"ModifierMyGeneralAttackWatchSpawnEntity"
  @description:"Whenever a my General attacks, spawn an entity"

  cardDataOrIndexToSpawn: null
  spawnCount: 0
  spawnPattern: null

  @createContextObject: (cardDataOrIndexToSpawn, spawnCount, spawnPattern, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    return contextObject

  onMyGeneralAttackWatch: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), @spawnPattern, card)
      for i in [0...@spawnCount]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierMyGeneralAttackWatchSpawnEntity
