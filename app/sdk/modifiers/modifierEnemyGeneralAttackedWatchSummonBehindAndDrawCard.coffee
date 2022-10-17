ModifierEnemyGeneralAttackedWatch = require './modifierEnemyGeneralAttackedWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierEnemyGeneralAttackedWatchSummonBehindAndDrawCard extends ModifierEnemyGeneralAttackedWatch

  type:"ModifierEnemyGeneralAttackedWatchSummonBehindAndDrawCard"
  @type:"ModifierEnemyGeneralAttackedWatchSummonBehindAndDrawCard"

  onEnemyGeneralAttackedWatch: (action) ->
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    board = @getGameSession().getBoard()

    playerOffset = 0
    if @getCard().isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
    behindPosition = {x:enemyGeneral.getPosition().x+playerOffset, y:enemyGeneral.getPosition().y}

    if board.isOnBoard(behindPosition) and !board.getObstructionAtPositionForEntity(behindPosition, @getCard())

      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), behindPosition.x, behindPosition.y, @getCard().getIndex())
      @getGameSession().executeAction(playCardAction)

      deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
      @getCard().getGameSession().executeAction(deck.actionDrawCard())

module.exports = ModifierEnemyGeneralAttackedWatchSummonBehindAndDrawCard
