ModifierImmuneToDamage =   require './modifierImmuneToDamage'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

###
  Modifier that reduces all damage dealt by minions or generals to this unit to 0.
###

class ModifierImmuneToDamageFromMinionsAndGenerals extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageFromMinionsAndGenerals"
  @type:"ModifierImmuneToDamageFromMinionsAndGenerals"

  @modifierName:i18next.t("modifiers.immune_to_damage_from_minions_and_generals_name")
  @description:i18next.t("modifiers.immune_to_damage_from_minions_and_generals_def")


  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof DamageAction and a.getIsValid() and @getCard() is a.getTarget() and a.getSource().getRootCard().getType() is CardType.Unit

module.exports = ModifierImmuneToDamageFromMinionsAndGenerals
