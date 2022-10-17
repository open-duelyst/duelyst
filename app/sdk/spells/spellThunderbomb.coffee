SpellDamage = require './spellDamage'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class SpellThunderbomb extends SpellDamage

  damageAmount: 3
  aoeAmount: 1

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    targetEntity = board.getUnitAtPosition(applyEffectPosition)
    enemyEntities = board.getFriendlyEntitiesAroundEntity(targetEntity, CardType.Unit, 1)
    
    super(board,x,y,sourceAction)

    #damage enemy units around target
    for entity in enemyEntities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getOwnerId())
      damageAction.setSource(@)
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@aoeAmount)
      @getGameSession().executeAction(damageAction)

module.exports = SpellThunderbomb
