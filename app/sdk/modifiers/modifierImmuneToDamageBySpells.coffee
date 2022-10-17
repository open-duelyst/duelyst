Logger = require 'app/common/logger'
ModifierImmuneToDamage = require './modifierImmuneToDamage'
DamageAction =   require 'app/sdk/actions/damageAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierImmuneToDamageBySpells extends ModifierImmuneToDamage

  type:"ModifierImmuneToDamageBySpells"
  @type:"ModifierImmuneToDamageBySpells"

  @description:i18next.t("modifiers.immune_to_damage_by_spells_def")

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof DamageAction and a.getIsValid() and @getCard() is a.getTarget() and a.getParentAction() instanceof ApplyCardToBoardAction and a.getParentAction().getCard()?.type is CardType.Spell

module.exports = ModifierImmuneToDamageBySpells
