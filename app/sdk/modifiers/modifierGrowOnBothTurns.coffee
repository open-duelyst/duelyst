Modifier = require './modifier'
i18next = require 'i18next'

class ModifierGrowOnBothTurns extends Modifier

  type:"ModifierGrowOnBothTurns"
  @type:"ModifierGrowOnBothTurns"

  @modifierName:i18next.t("modifiers.grow_on_both_turns_name")
  @description:i18next.t("modifiers.grow_on_both_turns_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierGrowOnBothTurns"]

module.exports = ModifierGrowOnBothTurns
