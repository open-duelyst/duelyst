Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'

class SpellHealToFull extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  healModifier: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)

    healAction = new HealAction(@getGameSession())
    healAction.manaCost = 0
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(entity)
    healAction.setHealAmount(entity.getDamage())

    @getGameSession().executeAction(healAction)

module.exports = SpellHealToFull
