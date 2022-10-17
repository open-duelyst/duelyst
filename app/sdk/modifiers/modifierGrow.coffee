ModifierStartTurnWatchBuffSelf = require './modifierStartTurnWatchBuffSelf'
CardType = require 'app/sdk/cards/cardType'
ModifierGrowOnBothTurns = require './modifierGrowOnBothTurns'

i18next = require('i18next')

class ModifierGrow extends ModifierStartTurnWatchBuffSelf

  type:"ModifierGrow"
  @type:"ModifierGrow"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.grow_def")

  @modifierName:i18next.t("modifiers.grow_name")
  @description: "+%X/+%X"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierGenericBuff", "FX.Modifiers.ModifierGrow"]

  @createContextObject: (growValue=0,options) ->
    options ?= {}
    options.appliedName = "Grow"
    contextObject = super(growValue, growValue, options)
    contextObject.growValue = growValue
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      if !modifierContextObject.isInherent
        return "Gains " + @description.replace(/%X/g, modifierContextObject.growValue) + " at start of your turn."
      else
        return @description.replace /%X/g, modifierContextObject.growValue
    else
      return @description

  onStartTurn: (e) ->
    # check if we need to grow on enemy's turn as well
    if !@getCard().isOwnersTurn()
      if @getCard().hasModifierType(ModifierGrowOnBothTurns.type)
        @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())
    super(e) # always grow on our own turn

  activateGrow: () ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  getGrowBonus: () ->
    return @growValue

module.exports = ModifierGrow
