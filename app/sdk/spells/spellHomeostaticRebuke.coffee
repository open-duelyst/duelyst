Logger = require 'app/common/logger'
Spell =   require('./spell')
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
CardType = require 'app/sdk/cards/cardType'

class SpellHomeostaticRebuke extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getUnitAtPosition({x:x, y:y})
    if target.getATK?() > 0
      attackAction = new ForcedAttackAction(@getGameSession())
      attackAction.setOwnerId(@ownerId)
      # source and target are same because minion deals damage to itself
      attackAction.setSource(target)
      attackAction.setTarget(target)
      attackAction.setDamageAmount(target.getATK())
      @getGameSession().executeAction(attackAction)

module.exports = SpellHomeostaticRebuke
