ModifierOpeningGambitApplyModifiers = require './modifierOpeningGambitApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitApplyModifiersRandomly extends ModifierOpeningGambitApplyModifiers

  ###
  This modifier is used to apply modifiers RANDOMLY to X entities around an entity on spawn.
  examples:
  2 random nearby friendly minions gain +1/+1
  1 random friendly minion gains provoke
  ###

  type:"ModifierOpeningGambitApplyModifiersRandomly"
  @type:"ModifierOpeningGambitApplyModifiersRandomly"

  @description: "Nearby friendly minions gain %X"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, managedByCard, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraIncludeGeneral, auraRadius, numberOfApplications, description, options) ->
    contextObject = super(modifiersContextObjects, managedByCard, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraIncludeGeneral, auraRadius, description, options)
    contextObject.numberOfApplications = numberOfApplications
    return contextObject

  getAffectedEntities: (action) ->
    affectedEntities = []
    if @getGameSession().getIsRunningAsAuthoritative()
      potentialAffectedEntities = super(action)
      for i in [0...@numberOfApplications]
        if potentialAffectedEntities.length > 0
          affectedEntities.push(potentialAffectedEntities.splice(@getGameSession().getRandomIntegerForExecution(potentialAffectedEntities.length), 1)[0])
    return affectedEntities

module.exports = ModifierOpeningGambitApplyModifiersRandomly
