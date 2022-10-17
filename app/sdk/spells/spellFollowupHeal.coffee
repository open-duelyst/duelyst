Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'

class SpellFollowupHeal extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  healAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellFollowupHeal::onApplyEffectToBoardTile -> #{@healAmount} heal to #{target.getName()} at #{x}, #{y}"

    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(target)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

module.exports = SpellFollowupHeal
