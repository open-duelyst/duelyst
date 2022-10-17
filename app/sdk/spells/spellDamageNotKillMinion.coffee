Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellDamageNotKillMinion extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, CardType.Unit)
    damageAmount = target.getHP() - 1

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setTarget(target)
    damageAction.setDamageAmount(damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = SpellDamageNotKillMinion
