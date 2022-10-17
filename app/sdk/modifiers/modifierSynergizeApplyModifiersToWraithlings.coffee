ModifierSynergizeApplyModifiers = require './modifierSynergizeApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierSynergizeApplyModifiersToWraithlings extends ModifierSynergizeApplyModifiers

  type:"ModifierSynergizeApplyModifiersToWraithlings"
  @type:"ModifierSynergizeApplyModifiersToWraithlings"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierSynergize", "FX.Modifiers.ModifierGenericBuff"]

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

module.exports = ModifierSynergizeApplyModifiersToWraithlings
