Logger = require 'app/common/logger'
Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
CardType = require 'app/sdk/cards/cardType'

i18next = require('i18next')

class ModifierAntiMagicField extends Modifier

  type: "ModifierAntiMagicField"
  @type: "ModifierAntiMagicField"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.antimagic_field_def")

  @modifierName: i18next.t("modifiers.antimagic_field_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1
  fxResource: ["FX.Modifiers.ModifierAntiMagicField"]

  onValidateAction: (event) ->
    a = event.action

    # cannot be targeted by spells
    if @getCard()? and a instanceof ApplyCardToBoardAction and a.getIsValid() and UtilsPosition.getPositionsAreEqual(@getCard().getPosition(), a.getTargetPosition())
      card = a.getCard()
      if card.getRootPlayedCard().type is CardType.Spell and !card.getTargetsSpace() and !card.getAppliesSameEffectToMultipleTargets()
        @invalidateAction(a, @getCard().getPosition(), "Protected by Anti-Magic Field.")

  onModifyActionForExecution: (event) ->
    a = event.action

    # cannot be damaged by spells
    if a instanceof DamageAction
      rootAction = a.getRootAction()
      if rootAction instanceof ApplyCardToBoardAction and rootAction.getCard().getRootPlayedCard().type is CardType.Spell and @getCard() and a.getTarget() is @getCard()
        a.setChangedByModifier(@)
        a.setDamageMultiplier(0)

module.exports = ModifierAntiMagicField
