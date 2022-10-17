Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
FightAction = require 'app/sdk/actions/fightAction'

class SpellFollowupFight extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    enemyUnit = board.getCardAtPosition(applyEffectPosition, @targetType)
    originalUnit = board.getCardAtPosition(@getFollowupSourcePosition(), @targetType)
    if enemyUnit? and originalUnit?
      fightAction = new FightAction(@getGameSession())
      fightAction.setOwnerId(@getOwnerId())
      fightAction.setSource(originalUnit)
      fightAction.setTarget(enemyUnit)
      @getGameSession().executeAction(fightAction)

module.exports = SpellFollowupFight
