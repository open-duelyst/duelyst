CONFIG = require 'app/common/config'
ModifierCannot = require './modifierCannot'
AttackAction = require 'app/sdk/actions/attackAction'
i18next = require 'i18next'

class ModifierCannotAttackGeneral extends ModifierCannot

  type: "ModifierCannotAttackGeneral"
  @type: "ModifierCannotAttackGeneral"

  @modifierName:i18next.t("modifiers.cannot_attack_general_name")
  @description:i18next.t("modifiers.cannot_attack_general_def")

  fxResource: ["FX.Modifiers.ModifierCannotAttackGeneral"]

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    # minion cannot actively attack General, but it can strike back, frenzy, etc
    if a instanceof AttackAction and a.getIsValid() and !a.getIsImplicit() and @getCard() is a.getSource() and a.getTarget()?.getIsGeneral()
      @invalidateAction(a, @getCard().getPosition(), i18next.t("modifiers.cannot_attack_general_error"))

module.exports = ModifierCannotAttackGeneral
