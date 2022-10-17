ModifierImmuneToDamage =   require './modifierImmuneToDamage'
DamageAction = require 'app/sdk/actions/damageAction'

###
  Modifier that reduces all damage dealt on enemy's turn to this unit to 0.
###

class ModifierImmuneToDamageOnEnemyTurn extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageOnEnemyTurn"
  @type:"ModifierImmModifierImmuneToDamageOnEnemyTurnuneToDamageByGeneral"

  @modifierName:"Enemy Turn Immunity"
  @description: "Takes no damage on enemy's turn"

  getIsActionRelevant: (a) ->
    return @getCard()? and @getGameSession().getCurrentTurn().getPlayerId() isnt @getCard().getOwnerId() and a instanceof DamageAction and a.getIsValid() and @getCard() is a.getTarget()

module.exports = ModifierImmuneToDamageOnEnemyTurn
