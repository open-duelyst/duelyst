ModifierSummonWatch = require './modifierSummonWatch'
Races = require 'app/sdk/cards/racesLookup'

class ModifierSummonWatchHydrax extends ModifierSummonWatch

  type:"ModifierSummonWatchHydrax"
  @type:"ModifierSummonWatchHydrax"

  @modifierName:"Modifier Summon Watch Hydrax"
  @description: "Whenever you summon a Battle Pet, it and Hydrax gain %X"

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

  onSummonWatch: (action) ->
    if @modifiersContextObjects?
      entity = action.getTarget()
      if entity?
        # apply self buff
        @getGameSession().applyModifierContextObject(@modifiersContextObjects[0], @getCard())
        # apply buff to battle pet being spawend
        @getGameSession().applyModifierContextObject(@modifiersContextObjects[1], entity)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(Races.BattlePet)

module.exports = ModifierSummonWatchHydrax
