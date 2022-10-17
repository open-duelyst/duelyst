Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
ModifierForcefieldAbsorb = require './modifierForcefieldAbsorb'

i18next = require('i18next')

class ModifierForcefield extends Modifier

  type:"ModifierForcefield"
  @type:"ModifierForcefield"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.forcefield_def")

  @modifierName:i18next.t("modifiers.forcefield_name")
  @description:null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierForcefield"]

  onActivate: () ->
    # apply one-time absorb effect as soon when this modifier becomes active
    @getGameSession().applyModifierContextObject(ModifierForcefieldAbsorb.createContextObject(), @getCard(), @)
    super()

  onStartTurn: (actionEvent) ->
    subMods = @getSubModifiers()
    if !subMods or subMods?.length == 0
      # re-apply forcefield one-time absorb effect if this modifier has no sub modifiers
      @getGameSession().applyModifierContextObject(ModifierForcefieldAbsorb.createContextObject(), @getCard(), @)
    super(actionEvent)

module.exports = ModifierForcefield
