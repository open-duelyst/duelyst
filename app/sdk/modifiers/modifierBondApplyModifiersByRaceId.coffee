ModifierBondAplyModifiers = require './modifierBondApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class ModifierBondApplyModifiersByRaceId extends ModifierBondAplyModifiers

  type:"ModifierBondApplyModifiersByRaceId"
  @type:"ModifierBondApplyModifiersByRaceId"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, managedByCard, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraIncludeGeneral, auraRadius, raceId, description, options) ->
    contextObject = super(modifiersContextObjects, managedByCard, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraIncludeGeneral, auraRadius, description, options)
    contextObject.raceId = raceId
    return contextObject

  getAffectedEntities: (action) ->
    affectedEntities = []
    if @getGameSession().getIsRunningAsAuthoritative()
      potentialAffectedEntities = super(action)
      for entity in potentialAffectedEntities
        if entity.getBelongsToTribe(@raceId)
          affectedEntities.push(entity)
    return affectedEntities

module.exports = ModifierBondApplyModifiersByRaceId
