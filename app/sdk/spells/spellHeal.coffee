Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'

class SpellHeal extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect
  healModifier: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellHeal::onApplyEffectToBoardTile -> healing #{entity.getLogName()} by #{@healModifier}"

    healAction = new HealAction(@getGameSession())
    healAction.manaCost = 0
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(entity)
    healAction.setHealAmount(@healModifier)

    @getGameSession().executeAction(healAction)

module.exports = SpellHeal
