ModifierOpeningGambit = require './modifierOpeningGambit'
Cards = require 'app/sdk/cards/cardsLookupComplete'
TeleportAction = require 'app/sdk/actions/teleportAction'
_ = require 'underscore'

class ModifierOpeningGambitMoveEnemyGeneralForward extends ModifierOpeningGambit

  type:"ModifierOpeningGambitMoveEnemyGeneralForward"
  @type:"ModifierOpeningGambitMoveEnemyGeneralForward"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
    enemyPosition = enemyGeneral.getPosition()
    board = @getGameSession().getBoard()
    if enemyGeneral.isOwnedByPlayer1() # if owned by player one, check the spot to the right of the general
      if enemyPosition.x < 8
        movePosition = board.getUnitAtPosition({x: enemyPosition.x + 1, y: enemyPosition.y})
        enemyPosition.x = enemyPosition.x + 1
    if enemyGeneral.isOwnedByPlayer2() # if owned by player two, check the spot to the left of the general
      if enemyPosition.x > 0
        movePosition = board.getUnitAtPosition({x: enemyPosition.x - 1, y: enemyPosition.y})
        enemyPosition.x = enemyPosition.x - 1

    if !movePosition? #if there's no unit currently sitting in the position we want to move the general
      teleAction = new TeleportAction(@getGameSession())
      teleAction.setOwnerId(@getOwnerId())
      teleAction.setSource(enemyGeneral)
      teleAction.setTargetPosition({x:enemyPosition.x, y: enemyPosition.y})
      teleAction.setFXResource(_.union(teleAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(teleAction)

module.exports = ModifierOpeningGambitMoveEnemyGeneralForward
