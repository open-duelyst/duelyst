CONFIG = require 'app/common/config'
Modifier = require './modifier'
i18next = require 'i18next'

class ModifierBanded extends Modifier

  type: "ModifierBanded"
  @type: "ModifierBanded"

  @modifierName:i18next.t("modifiers.banded_name")
  @description:i18next.t("modifiers.banded_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierZealed"]

  @createContextObject: (attack = 0, maxHP = 0, options = undefined) ->
    contextObject = super(options)
    contextObject.attributeBuffs = Modifier.createAttributeBuffsObject(attack, maxHP)
    return contextObject

module.exports = ModifierBanded
