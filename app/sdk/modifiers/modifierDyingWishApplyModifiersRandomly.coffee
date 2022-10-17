ModifierDyingWishApplyModifiers = require './modifierDyingWishApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishApplyModifiersRandomly extends ModifierDyingWishApplyModifiers

  ###
  This modifier is used to apply modifiers RANDOMLY to X entities around an entity when it dies.
  examples:
  2 random nearby friendly minions gain +1/+1
  1 random friendly minion gains provoke
  ###

  type:"ModifierDyingWishApplyModifiersRandomly"
  @type:"ModifierDyingWishApplyModifiersRandomly"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, managedByCard, auraIncludeSelf, auraIncludeAlly, auraIncludeEnemy, auraIncludeGeneral, auraRadius, numberOfApplications, description, options) ->
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

module.exports = ModifierDyingWishApplyModifiersRandomly
