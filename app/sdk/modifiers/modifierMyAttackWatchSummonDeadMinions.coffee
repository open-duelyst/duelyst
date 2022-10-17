ModifierMyAttackWatch = require './modifierMyAttackWatch'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierMyAttackWatchSummonDeadMinions extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchSummonDeadMinions"
  @type:"ModifierMyAttackWatchSummonDeadMinions"

  numMinions = 0

  @createContextObject: (numMinions,options) ->
    contextObject = super(options)
    contextObject.numMinions = numMinions
    return contextObject

  onMyAttackWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      deadMinions = @getGameSession().getDeadUnits(@getCard().getOwnerId())
      if deadMinions? and deadMinions.length > 0
        numToSpawn = @numMinions
        if deadMinions.length < numToSpawn
          numToSpawn = deadMinions.length
        for i in [0...numToSpawn]
          minion = deadMinions.splice(@getGameSession().getRandomIntegerForExecution(deadMinions.length), 1)[0]
          validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.ALL_BOARD_POSITIONS, minion)
          if validSpawnLocations.length > 0
            location = validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0]
            cardData = minion.createNewCardData()
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), location.x, location.y, cardData)
            playCardAction.setSource(@getCard())
            @getGameSession().executeAction(playCardAction)

module.exports = ModifierMyAttackWatchSummonDeadMinions
