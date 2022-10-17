ModifierImmune = require './modifierImmune'
AttackAction =   require 'app/sdk/actions/attackAction'
i18next = require 'i18next'

###
  Modifier that invalidates explicit attacks against this unit.
###

class ModifierImmuneToAttacks extends ModifierImmune

  type: "ModifierImmuneToAttacks"
  @type: "ModifierImmuneToAttacks"

  fxResource: ["FX.Modifiers.ModifierImmunity", "FX.Modifiers.ModifierImmunityAttack"]

  onValidateAction: (event) ->
    a = event.action

    if @getIsActionRelevant(a)
      @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.immune_to_attacks_error"))

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof AttackAction and a.getIsValid() and !a.getIsImplicit() and @getCard() is a.getTarget()

module.exports = ModifierImmuneToAttacks
