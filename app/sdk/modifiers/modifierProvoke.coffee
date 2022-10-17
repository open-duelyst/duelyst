CONFIG =     require 'app/common/config'
Logger = require 'app/common/logger'
Modifier =   require './modifier'
AttackAction =   require 'app/sdk/actions/attackAction'
ModifierProvoked =   require './modifierProvoked'
_ = require 'underscore'

i18next = require('i18next')

class ModifierProvoke extends Modifier

  type:"ModifierProvoke"
  @type:"ModifierProvoke"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.provoke_def")
  maxStacks: 1

  @modifierName: i18next.t("modifiers.provoke_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  isAura: true
  auraRadius: 1
  auraIncludeSelf: false
  auraIncludeAlly: false
  auraIncludeEnemy: true

  modifiersContextObjects: [ModifierProvoked.createContextObject()]
  fxResource: ["FX.Modifiers.ModifierProvoke"]

module.exports = ModifierProvoke
