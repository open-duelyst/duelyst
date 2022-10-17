Logger = require 'app/common/logger'
ModifierImmuneToSpells = require './modifierImmuneToSpells'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
UtilsPosition = require 'app/common/utils/utils_position'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierImmuneToSpellsByEnemy extends ModifierImmuneToSpells

  type:"ModifierImmuneToSpellsByEnemy"
  @type:"ModifierImmuneToSpellsByEnemy"

  @description:i18next.t("modifiers.immune_to_spells_by_enemy_def")

  onValidateAction: (event) ->
    a = event.action

    if @getCard()? and a.getOwner() is @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()) and a instanceof ApplyCardToBoardAction and a.getIsValid() and UtilsPosition.getPositionsAreEqual(@getCard().getPosition(), a.getTargetPosition()) # may be trying to target this unit
      card = a.getCard()
      # is this in fact an enemy spell directly trying to target this unit? (not this space, not multiple spaces - directly targeting this unit)
      if card? and card.getRootCard()?.type is CardType.Spell and !card.getTargetsSpace() and !card.getAppliesSameEffectToMultipleTargets()
        @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.immune_to_attacks_error"))

module.exports = ModifierImmuneToSpellsByEnemy
