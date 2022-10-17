Modifier = require './modifier'
ModifierDyingWish = require './modifierDyingWish'
ModifierSilence = require './modifierSilence'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierDyingWishDispelNearestEnemy extends ModifierDyingWish

  type:"ModifierDyingWishDispelNearestEnemy"
  @type:"ModifierDyingWishDispelNearestEnemy"

  @description:"Dispel the nearest enemy minion"

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  onDyingWish: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      bestAbsoluteDistance = 9999
      potentialTargets = []
      for potentialTarget in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
        if !potentialTarget.getIsGeneral() and potentialTarget.getIsActive() # don't target Generals or inactive cards for dispel
          absoluteDistance = Math.abs(@getCard().position.x - potentialTarget.position.x) + Math.abs(@getCard().position.y - potentialTarget.position.y)
          # found a new best target
          if absoluteDistance < bestAbsoluteDistance
            bestAbsoluteDistance = absoluteDistance
            potentialTargets = [] # reset potential targets
            potentialTargets.push(potentialTarget)
            #found an equally good target
          else if absoluteDistance == bestAbsoluteDistance
            potentialTargets.push(potentialTarget)

      if potentialTargets.length > 0
        # choose randomly between all equally close enemy minions and dispel one
        target = potentialTargets[@getGameSession().getRandomIntegerForExecution(potentialTargets.length)]
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), target)


module.exports = ModifierDyingWishDispelNearestEnemy
