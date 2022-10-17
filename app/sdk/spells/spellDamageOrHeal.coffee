Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class SpellDamageOrHeal extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  damageOrHealAmount: 2

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, @targetType)

    if target.getOwnerId() is @getOwnerId()
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@ownerId)
      healAction.setTarget(target)
      healAction.setHealAmount(@damageOrHealAmount)
      @getGameSession().executeAction(healAction)
    else
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@ownerId)
      damageAction.setTarget(target)
      damageAction.setDamageAmount(@damageOrHealAmount)
      @getGameSession().executeAction(damageAction)

module.exports = SpellDamageOrHeal
