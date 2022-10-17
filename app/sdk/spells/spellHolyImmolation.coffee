Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellHolyImmolation extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect
  healAmount: 0
  damageAmount: 0


  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    targetEntity = board.getCardAtPosition(applyEffectPosition, @targetType)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellHolyImmolation::onApplyEffectToBoardTile -> immolate #{targetEntity.name}"

    #heal the spell's target (your unit)
    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(targetEntity)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

    #damage enemy unit's around your unit
    entities = board.getEnemyEntitiesAroundEntity(targetEntity, CardType.Unit, 1)
    for entity in entities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(targetEntity.getOwnerId())
      damageAction.setSource(@)
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = SpellHolyImmolation
