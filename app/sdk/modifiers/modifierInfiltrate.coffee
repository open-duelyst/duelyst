ModifierSituationalBuffSelf = require './modifierSituationalBuffSelf'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
_ = require 'underscore'
ModifierAlwaysInfiltrated = require 'app/sdk/modifiers/modifierAlwaysInfiltrated'
ModifierProvidesAlwaysInfiltrated = require 'app/sdk/modifiers/modifierProvidesAlwaysInfiltrated'

i18next = require('i18next')

class ModifierInfiltrate extends ModifierSituationalBuffSelf

  type:"ModifierInfiltrate"
  @type:"ModifierInfiltrate"

  @isKeyworded: true

  @modifierName:i18next.t("modifiers.infiltrate_name")
  @description:"Whenever this minion is on the enemy side of the battlefield.."
  @keywordDefinition:i18next.t("modifiers.infiltrate_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierInfiltrate"]

  @createContextObject: (modifiersContextObjects, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    if modifiersContextObjects?
      for modifierContextObject of modifiersContextObjects
        modifierContextObject.appliedName ?= "Infiltrated"
    contextObject.description = description
    return contextObject

  getIsSituationActiveForCache: () ->
    if @getCard().hasModifierType(ModifierAlwaysInfiltrated.type)
      return true
    for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
      if unit.hasActiveModifierClass(ModifierProvidesAlwaysInfiltrated)
        return true
    # infiltrate is active when this entity is on the enemy side of the battlefield (determined by player starting side)

    # begin with "my side" defined as whole board
    enemySideStartX = 0
    enemySideEndX = CONFIG.BOARDCOL

    if @getCard().isOwnedByPlayer1()
      enemySideStartX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 + 1)
    else if @getCard().isOwnedByPlayer2()
      enemySideEndX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 - 1)

    x = @getCard().getPosition().x
    return x >= enemySideStartX and x <= enemySideEndX

module.exports = ModifierInfiltrate
