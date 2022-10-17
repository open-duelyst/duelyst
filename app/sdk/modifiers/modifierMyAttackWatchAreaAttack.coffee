ModifierMyAttackWatch = require './modifierMyAttackWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierMyAttackWatchAreaAttack extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchAreaAttack"
  @type:"ModifierMyAttackWatchAreaAttack"

  onMyAttackWatch: (action) ->

    entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(action.getTarget(), CardType.Unit, 1)
    if entities?
      for entity in entities
        if entity?
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(entity)
          damageAction.setDamageAmount(@getCard().getATK())
          @getGameSession().executeAction(damageAction)

module.exports = ModifierMyAttackWatchAreaAttack
