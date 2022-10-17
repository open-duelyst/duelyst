ModifierImmuneToDamage =   require './modifierImmuneToDamage'
DamageAction =   require 'app/sdk/actions/damageAction'

###
  Modifier that reduces all damage dealt by generals to this unit to 0.
###

class ModifierImmuneToDamageFromEnemyMinions extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageFromEnemyMinions"
  @type:"ModifierImmuneToDamageFromEnemyMinions"

  @modifierName:"Enemy Minion Immunity"
  @description: "Takes no damage from enemy minions"

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof DamageAction and a.getIsValid() and @getCard() is a.getTarget() and !(a.getSource()?.getIsGeneral()) and (a.getSource()?.getOwnerId() isnt @getCard().getOwnerId())

module.exports = ModifierImmuneToDamageFromEnemyMinions
