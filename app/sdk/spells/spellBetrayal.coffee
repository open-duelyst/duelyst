Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'

class SpellBetrayal extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    minions = board.getFriendlyEntitiesAroundEntity(enemyGeneral, CardType.Unit, 1, true, false)

    if minions?
      for minion in minions
        if minion.getATK() > 0
          a = @getGameSession().createActionForType(ForcedAttackAction.type)
          a.setSource(minion)
          a.setTarget(enemyGeneral)
          a.setOwnerId(@getOwnerId())
          @getGameSession().executeAction(a)

module.exports = SpellBetrayal
