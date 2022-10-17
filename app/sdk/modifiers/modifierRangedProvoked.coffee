CONFIG = require 'app/common/config'
Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'
i18next = require 'i18next'

class ModifierRangedProvoked extends Modifier

  type: "ModifierRangedProvoked"
  @type: "ModifierRangedProvoked"

  @modifierName:i18next.t("modifiers.ranged_provoked_name")
  @description:i18next.t("modifiers.ranged_provoked_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierProvoked"]

module.exports = ModifierRangedProvoked
