Modifier = require './modifier'
i18next = require 'i18next'

class ModifierStackingShadowsDebuff extends Modifier

  type: "ModifierStackingShadowsDebuff"
  @type: "ModifierStackingShadowsDebuff"

  @modifierName:i18next.t("modifiers.stacking_shadows_debuff_name")
  @description:i18next.t("modifiers.stacking_shadows_debuff_def")

  @isHiddenToUI: true

  @createContextObject: (options) ->
    contextObject = super(options)
    modifiersContextObjects = [Modifier.createContextObject()]
    modifiersContextObjects[0].description = i18next.t("modifiers.stacking_shadows_debuff_def")
    modifiersContextObjects[0].modifierName = i18next.t("modifiers.stacking_shadows_debuff_name")
    contextObject.activeInHand = false
    contextObject.activeInDeck = false
    contextObject.activeInSignatureCards = false
    contextObject.activeOnBoard = true
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.isAura = true
    contextObject.auraIncludeSelf = false
    contextObject.auraIncludeAlly = false
    contextObject.auraIncludeEnemy = true
    contextObject.auraIncludeGeneral = true
    contextObject.auraRadius = 0
    return contextObject

module.exports = ModifierStackingShadowsDebuff
