ModifierSummonWatchFromActionBarAnyPlayer = require './modifierSummonWatchFromActionBarAnyPlayer'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers extends ModifierSummonWatchFromActionBarAnyPlayer

  type:"ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers"
  @type:"ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers"

  @description: "All minions summoned from the action bar %X"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

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
    summonedUnitPosition = action.getTarget()?.getPosition()

    if @modifiersContextObjects? and @getIsValidBuffPosition(summonedUnitPosition)
      entity = action.getTarget()
      if entity?
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getIsValidBuffPosition: (summonedUnitPosition) ->
    # override this in subclass to filter by position
    return true

module.exports = ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers
