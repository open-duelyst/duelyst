Logger = require 'app/common/logger'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
TeleportAction = require 'app/sdk/actions/teleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class SpellKneel extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellKneel::onApplyEffectToBoardTile "
    source = board.getCardAtPosition(applyEffectPosition, @targetType)
    teleAction = new TeleportAction(@getGameSession())
    teleAction.setOwnerId(@getOwnerId())
    teleAction.setSource(source)
    teleAction.setTargetPosition(@getTeleportTargetPosition())
    teleAction.setFXResource(_.union(teleAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(teleAction)


  getTeleportTargetPosition: () ->
    targetGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if targetGeneral?
      # set x offset based on which direction the target General faces
      targetGeneralPosition = targetGeneral.getPosition()
      if targetGeneral.isOwnedByPlayer1() then offset = 1 else offset = -1
      return {x: targetGeneralPosition.x + offset, y: targetGeneralPosition.y}
    return

  _postFilterPlayPositions: (validPositions) ->
    # if there is a valid unit to teleport, and the position we want to teleport to is empty and on the board
    board = @getGameSession().getBoard()
    if (
      (validPositions.length > 0) and
      (!board.getCardAtPosition(@getTeleportTargetPosition(), @targetType)) and
      (board.isOnBoard(@getTeleportTargetPosition()))
    )
      # allow the spell to be cast
      return super(validPositions)
    else
      return []

module.exports = SpellKneel
