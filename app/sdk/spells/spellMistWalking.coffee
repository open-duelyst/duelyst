Logger = require 'app/common/logger'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
TeleportAction = require 'app/sdk/actions/teleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class SpellMistWalking extends Spell

  spellFilterType: SpellFilterType.None
  targetType: CardType.Unit

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellMistWalking::onApplyEffectToBoardTile "
    source = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    teleAction = new TeleportAction(@getGameSession())
    teleAction.setOwnerId(@getOwnerId())
    teleAction.setSource(source)
    teleAction.setTargetPosition({x:x, y:y})
    teleAction.setFXResource(_.union(teleAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(teleAction)


  _filterPlayPositions: (spellPositions) ->
    validPositions = []
    generalPosition = @getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()
    board = @getGameSession().getBoard()
    for position in CONFIG.PATTERN_2SPACES
      pos = {x:generalPosition.x+position.x, y:generalPosition.y+position.y}
      if !board.getCardAtPosition(pos, CardType.Unit) and board.isOnBoard(pos)
        validPositions.push(pos)
    return validPositions

module.exports = SpellMistWalking
