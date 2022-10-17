ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierMyGeneralDamagedWatchMiniMinion extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchMiniMinion"
  @type:"ModifierMyGeneralDamagedWatchMiniMinion"

  fxResource: ["FX.Modifiers.ModifierMyGeneralDamagedWatch"]

  activeInHand: true
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: false

  onDamageDealtToGeneral: (action) ->

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    board = @getGameSession().getBoard()

    playerOffset = 0
    if @getCard().isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
    behindPosition = {x:enemyGeneral.getPosition().x+playerOffset, y:enemyGeneral.getPosition().y}

    if board.isOnBoard(behindPosition) and !board.getObstructionAtPositionForEntity(behindPosition, @getCard())
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), behindPosition.x, behindPosition.y, @getCard().getIndex())
      @getGameSession().executeAction(playCardAction)
      @getGameSession().executeAction(new DrawCardAction(@getGameSession(), @getCard().getOwnerId()))

module.exports = ModifierMyGeneralDamagedWatchMiniMinion
