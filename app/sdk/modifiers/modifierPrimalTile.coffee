Modifier = require './modifier'
ModifierGrowPermanent = require './modifierGrowPermanent'

i18next = require('i18next')

class ModifierPrimalTile extends Modifier

  type: "ModifierPrimalTile"
  @type: "ModifierPrimalTile"

  @modifierName: i18next.t("modifiers.primal_flourish_name")
  @keywordDefinition: i18next.t("modifiers.primal_flourish_def")
  @description: i18next.t("modifiers.primal_flourish_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierPrimalTile"]

  @getDescription: () ->
    return @description

  @createContextObject: (options) ->
    contextObject = super(options)
    modifiersContextObjects = [ModifierGrowPermanent.createContextObject(2)]
    modifiersContextObjects[0].description = @description
    modifiersContextObjects[0].modifierName = @modifierName
    contextObject.activeInHand = false
    contextObject.activeInDeck = false
    contextObject.activeInSignatureCards = false
    contextObject.activeOnBoard = true
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.isAura = true
    contextObject.auraIncludeSelf = false
    contextObject.auraIncludeAlly = true
    contextObject.auraIncludeEnemy = false
    contextObject.auraIncludeGeneral = false
    contextObject.auraRadius = 0
    return contextObject

module.exports = ModifierPrimalTile
