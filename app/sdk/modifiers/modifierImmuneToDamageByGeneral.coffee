ModifierImmuneToDamage =   require './modifierImmuneToDamage'
AttackAction =   require 'app/sdk/actions/attackAction'
i18next = require 'i18next'

###
  Modifier that reduces all damage dealt by generals to this unit to 0.
###

class ModifierImmuneToDamageByGeneral extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageByGeneral"
  @type:"ModifierImmuneToDamageByGeneral"

  @modifierName:i18next.t("modifiers.immune_to_damage_by_general_name")
  @description:i18next.t("modifiers.immune_to_damage_by_general_def")

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and @getCard() is a.getTarget() and a.getSource()?.getIsGeneral()

module.exports = ModifierImmuneToDamageByGeneral
