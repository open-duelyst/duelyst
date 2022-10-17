SpellIntensify = require './spellIntensify'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellIntensifyDealDamage extends SpellIntensify

  damageAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, CardType.Unit)

    totalDamageAmount = @damageAmount * @getIntensifyAmount()

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setTarget(target)
    damageAction.setDamageAmount(totalDamageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = SpellIntensifyDealDamage
