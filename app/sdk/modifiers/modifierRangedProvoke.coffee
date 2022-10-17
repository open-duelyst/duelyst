CONFIG =     require 'app/common/config'
Logger = require 'app/common/logger'
Modifier =   require './modifier'
AttackAction =   require 'app/sdk/actions/attackAction'
ModifierRangedProvoked =   require './modifierRangedProvoked'
ModifierRanged = require './modifierRanged'
_ = require 'underscore'
i18next = require 'i18next'

class ModifierRangedProvoke extends Modifier

  type:"ModifierRangedProvoke"
  @type:"ModifierRangedProvoke"

  maxStacks: 1

  @modifierName:i18next.t("modifiers.ranged_provoke_name")
  @description:i18next.t("modifiers.ranged_provoke_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  isAura: true
  auraRadius: CONFIG.WHOLE_BOARD_RADIUS
  auraIncludeSelf: false
  auraIncludeAlly: false
  auraIncludeEnemy: true

  modifiersContextObjects: [ModifierRangedProvoked.createContextObject()]
  fxResource: ["FX.Modifiers.ModifierProvoke"]

  onValidateAction:(actionEvent) ->
    a = actionEvent.action
    if @getCard()? and a instanceof AttackAction and !a.getIsImplicit() and a.getIsValid() and !@getCard().getIsSameTeamAs(a.getSource()) and _.contains(@getEntitiesInAura(), a.getSource()) and !a.getTarget().hasModifierType(ModifierRangedProvoke.type)
      # in the case of attacking melee provoker, don't invalidate
      if !(a.getSource().getIsProvoked() and _.contains(a.getTarget().getEntitiesProvoked(),a.getSource()))
        @invalidateAction(a, @getCard().getPosition(), "Provoked - must first attack the Provoker.")

  _filterPotentialCardInAura: (card) ->
    return card.hasActiveModifierClass(ModifierRanged) and super(card)

module.exports = ModifierRangedProvoke
