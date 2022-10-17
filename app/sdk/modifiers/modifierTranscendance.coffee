Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
i18next = require('i18next')


class ModifierTranscendance extends Modifier

  type:"ModifierTranscendance"
  @type:"ModifierTranscendance"


  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.celerity_def")

  @modifierName:i18next.t("modifiers.celerity_name")
  @description: ""

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  attributeBuffs:
    attacks: 1
    moves: 1

  fxResource: ["FX.Modifiers.ModifierCelerity"]

module.exports = ModifierTranscendance
