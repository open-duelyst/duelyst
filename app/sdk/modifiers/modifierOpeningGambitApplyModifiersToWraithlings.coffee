ModifierOpeningGambitApplyModifiers = require './modifierOpeningGambitApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpeningGambitApplyModifiersToWraithlings extends ModifierOpeningGambitApplyModifiers

  type:"ModifierOpeningGambitApplyModifiersToWraithlings"
  @type:"ModifierOpeningGambitApplyModifiersToWraithlings"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, auraRadius, description, options) ->
    contextObject = super(modifiersContextObjects, false, false, true, false, false, auraRadius, description, options)
    contextObject.cardId = Cards.Faction4.Wraithling
    return contextObject

  getAffectedEntities: (action) ->
    affectedEntities = []
    if @getGameSession().getIsRunningAsAuthoritative()
      potentialAffectedEntities = super(action)
      for entity in potentialAffectedEntities
        if entity.getBaseCardId() is @cardId
          affectedEntities.push(entity)
    return affectedEntities

module.exports = ModifierOpeningGambitApplyModifiersToWraithlings
