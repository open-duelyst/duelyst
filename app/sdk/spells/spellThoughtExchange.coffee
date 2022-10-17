Logger = require 'app/common/logger'
Spell =             require('./spell')
IntentType =           require('app/sdk/intentType')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
SwapUnitAllegianceAction =     require('app/sdk/actions/swapUnitAllegianceAction')

class SpellThoughtExchange extends Spell

  targetType: CardType.Unit

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getUnitAtPosition(applyEffectPosition)
    surroundingEnemies = board.getEnemyEntitiesAroundEntity(entity, @targetType)
    attackThreshold = entity.getATK()
    a = new SwapUnitAllegianceAction(@getGameSession())
    a.setTarget(entity)
    @getGameSession().executeAction(a)

    if surroundingEnemies.length > 0
      for enemy in surroundingEnemies
        if enemy.getATK() < attackThreshold and !enemy.getIsGeneral()
          swapAction = new SwapUnitAllegianceAction(@getGameSession())
          swapAction.setTarget(enemy)
          @getGameSession().executeAction(swapAction)


module.exports = SpellThoughtExchange
