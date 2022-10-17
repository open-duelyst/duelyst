Logger = require 'app/common/logger'
ModifierImmune = require './modifierImmune'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
UtilsPosition = require 'app/common/utils/utils_position'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierImmuneToSpells extends ModifierImmune

  type:"ModifierImmuneToSpells"
  @type:"ModifierImmuneToSpells"

  @modifierName:i18next.t("modifiers.immune_to_spells_name")
  @description:i18next.t("modifiers.immune_to_spells_def")

  fxResource: ["FX.Modifiers.ModifierImmunity", "FX.Modifiers.ModifierImmunitySpell"]

  onValidateAction: (event) ->
    a = event.action

    if @getCard()? and a instanceof ApplyCardToBoardAction and a.getIsValid() and UtilsPosition.getPositionsAreEqual(@getCard().getPosition(), a.getTargetPosition())
      card = a.getCard()
      if card? and card.getRootCard()?.type is CardType.Spell and !card.getTargetsSpace() and !card.getAppliesSameEffectToMultipleTargets()
        @invalidateAction(a, @getCard().getPosition(), "[Not] a valid target.")

module.exports = ModifierImmuneToSpells
