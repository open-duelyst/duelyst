ModifierImmuneToAttacks =   require './modifierImmuneToAttacks'
AttackAction =   require 'app/sdk/actions/attackAction'

###
  Modifier that invalidates attacks against this unit from generals.
###

class ModifierImmuneToAttacksByGeneral extends ModifierImmuneToAttacks

  type:"ModifierImmuneToAttacksByGeneral"
  @type:"ModifierImmuneToAttacksByGeneral"

  @modifierName:"General Immunity"
  @description: "Cannot be attacked by Generals"

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and !a.getIsImplicit() and @getCard() is a.getTarget() and a.getSource()?.getIsGeneral()

module.exports = ModifierImmuneToAttacksByGeneral
