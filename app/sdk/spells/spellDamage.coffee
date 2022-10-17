Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellDamage extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect
  damageAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, @targetType)
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellDamage::onApplyEffectToBoardTile -> #{@damageAmount} damage to #{target?.getLogName()} at #{x}, #{y}"

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setTarget(target)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = SpellDamage
