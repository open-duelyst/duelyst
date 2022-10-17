ModifierOpeningGambitApplyModifiers = require './modifierOpeningGambitApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitApplyModifiersByRaceId extends ModifierOpeningGambitApplyModifiers

  ###
  This modifier is used to apply modifiers RANDOMLY to X entities around an entity on spawn.
  examples:
  2 random nearby friendly minions gain +1/+1
  1 random friendly minion gains provoke
  ###

  type:"ModifierOpeningGambitApplyModifiersByRaceId"
  @type:"ModifierOpeningGambitApplyModifiersByRaceId"

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

module.exports = ModifierOpeningGambitApplyModifiersByRaceId
