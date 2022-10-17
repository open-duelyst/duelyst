ModifierImmuneToAttacks =   require './modifierImmuneToAttacks'
AttackAction =   require 'app/sdk/actions/attackAction'

###
  Modifier that invalidates attacks against this unit from sources that are ranged.
###

class ModifierImmuneToAttacksByRanged extends ModifierImmuneToAttacks

  type:"ModifierImmuneToAttacksByRanged"
  @type:"ModifierImmuneToAttacksByRanged"

  @modifierName:"Ranged Immunity"
  @description: "Cannot be attacked by ranged minions"

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and @getCard() is a.getTarget() and a.getSource()?.isRanged()

module.exports = ModifierImmuneToAttacksByRanged
