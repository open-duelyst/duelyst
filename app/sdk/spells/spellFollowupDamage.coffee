Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellFollowupDamage extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  damageAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellFollowupDamage::onApplyEffectToBoardTile -> #{@damageAmount} damage to #{target.getName()} at #{x}, #{y}"

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setTarget(target)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = SpellFollowupDamage
