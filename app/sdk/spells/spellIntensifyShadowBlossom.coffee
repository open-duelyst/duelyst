SpellIntensify = require './spellIntensify'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'

class SpellIntensifyShadowBlossom extends SpellIntensify

  spawnCount: 1

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()

      possiblePositions = []
      board = @getGameSession().getBoard()
      for unit in board.getUnits()
        if unit? and !unit.getIsGeneral() and unit.getOwnerId() != @getOwnerId()
          tileAtPosition = board.getTileAtPosition(unit.getPosition(), true)
          if !tileAtPosition? or tileAtPosition.getBaseCardId() != Cards.Tile.Shadow or tileAtPosition.getOwnerId() != @getOwnerId()
            possiblePositions.push(unit.getPosition())

      totalSpawnAmount = @getIntensifyAmount() * @spawnCount
      numToSpawnUnderEnemies = Math.min(totalSpawnAmount, possiblePositions.length)
      remainderToSpawn = totalSpawnAmount - numToSpawnUnderEnemies

      for [0...numToSpawnUnderEnemies]
        spawnPosition = possiblePositions.splice(@getGameSession().getRandomIntegerForExecution(possiblePositions.length), 1)[0]
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), spawnPosition.x, spawnPosition.y, {id: Cards.Tile.Shadow})
        @getGameSession().executeAction(playCardAction)

      if remainderToSpawn > 0
        tileCard = @getGameSession().getExistingCardFromIndexOrCachedCardFromData({id: Cards.Tile.Shadow})
        spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x: 0, y:0}, CONFIG.PATTERN_WHOLE_BOARD, tileCard, @, remainderToSpawn)
        for spawnPosition in spawnPositions
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), spawnPosition.x, spawnPosition.y, {id: Cards.Tile.Shadow})
          spawnAction.setSource(@)
          @getGameSession().executeAction(spawnAction)

module.exports = SpellIntensifyShadowBlossom
