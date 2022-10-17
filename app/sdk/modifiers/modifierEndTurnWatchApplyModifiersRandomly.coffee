ModifierEndTurnWatchApplyModifiers = require './modifierEndTurnWatchApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class ModifierEndTurnWatchApplyModifiersRandomly extends ModifierEndTurnWatchApplyModifiers

  ###
  This modifier is used to apply modifiers RANDOMLY to X entities around an entity on end turn.
  examples:
  2 random nearby friendly minions gain +1/+1
  1 random friendly minion gains provoke
  ###

  type:"ModifierEndTurnWatchApplyModifiersRandomly"
  @type:"ModifierEndTurnWatchApplyModifiersRandomly"

  @description: "At the end of your turn, %X"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraRadius, auraIncludeGeneral, description, numberOfApplications, options) ->
    contextObject = super(modifiersContextObjects, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraRadius, auraIncludeGeneral, description, options)
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

module.exports = ModifierEndTurnWatchApplyModifiersRandomly
