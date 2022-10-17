Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
RemoveAction = require 'app/sdk/actions/removeAction'

class SpellRemoveTarget extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, @targetType)
    if target?

      removeAction = new RemoveAction(@getGameSession())
      removeAction.setOwnerId(@getOwnerId())
      removeAction.setTarget(target)
      @getGameSession().executeAction(removeAction)

module.exports = SpellRemoveTarget