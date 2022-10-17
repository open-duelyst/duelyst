Logger = require 'app/common/logger'
CardType = require 'app/sdk/cards/cardType'
ModifierImmuneToDamage = require './modifierImmuneToDamage'
DamageAction = require 'app/sdk/actions/damageAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
i18next = require 'i18next'

class ModifierImmuneToSpellDamage extends ModifierImmuneToDamage

  type: "ModifierImmuneToSpellDamage"
  @type: "ModifierImmuneToSpellDamage"

  @modifierName:i18next.t("modifiers.immune_to_spell_damage_name")
  @description:i18next.t("modifiers.immune_to_spell_damage_def")

  fxResource: ["FX.Modifiers.ModifierImmunity", "FX.Modifiers.ModifierImmunitySpell"]

  getIsActionRelevant: (a) ->
    if @getCard()? and a instanceof DamageAction and @getCard() is a.getTarget() and !a.getCreatedByTriggeringModifier() and a.getSource()?.getType() is CardType.Spell
      rootAction = a.getRootAction()
      # this action was not triggered by a modifier, but was it caused by a spell cast?
      if rootAction instanceof ApplyCardToBoardAction and rootAction.getCard().getRootCard()?.getType() is CardType.Spell
        return true
    return false

module.exports = ModifierImmuneToSpellDamage
