Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
ModifierEgg = require './modifierEgg'

class ModifierSummonWatchFromEggApplyModifiers extends Modifier

  type:"ModifierSummonWatchFromEggApplyModifiers"
  @type:"ModifierSummonWatchFromEggApplyModifiers"

  @modifierName:"Summon Watch"
  @description: "Friendly minions that hatch from Eggs %X"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.buffDescription
    else
      return @description

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for a unit being summoned from an egg by the player who owns this entity
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Unit and action.getCard() isnt @getCard()
      if action.getTriggeringModifier() instanceof ModifierEgg
        entity = action.getTarget()
        if entity?
          for modifierContextObject in @modifiersContextObjects
            @getGameSession().applyModifierContextObject(modifierContextObject, entity)

module.exports = ModifierSummonWatchFromEggApplyModifiers
