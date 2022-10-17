ModifierImmuneToDamage =   require './modifierImmuneToDamage'
AttackAction =   require 'app/sdk/actions/attackAction'

###
  Modifier that reduces all damage dealt by ranged to this unit to 0.
###

class ModifierImmuneToDamageByRanged extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageByRanged"
  @type:"ModifierImmuneToDamageByRanged"

  @modifierName:"Ranged Immunity"
  @description: "Takes no damage from Ranged minions and Generals"

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and @getCard() is a.getTarget() and a.getSource()?.isRanged()

module.exports = ModifierImmuneToDamageByRanged
