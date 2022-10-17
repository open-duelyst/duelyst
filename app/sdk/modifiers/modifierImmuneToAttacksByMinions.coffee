ModifierImmuneToAttacks =   require './modifierImmuneToAttacks'
AttackAction =   require 'app/sdk/actions/attackAction'

###
  Modifier that invalidates attacks against this unit from minions.
###

class ModifierImmuneToAttacksByMinions extends ModifierImmuneToAttacks

  type:"ModifierImmuneToAttacksByMinions"
  @type:"ModifierImmuneToAttacksByMinions"

  @modifierName:"Minion Immunity"
  @description: "Cannot be attacked by Minions"

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and !a.getIsImplicit() and @getCard() is a.getTarget() and !a.getSource()?.getIsGeneral()

module.exports = ModifierImmuneToAttacksByMinions
