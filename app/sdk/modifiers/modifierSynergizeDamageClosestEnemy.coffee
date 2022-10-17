ModifierSynergize = require './modifierSynergize'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSynergizeDamageClosestEnemy extends ModifierSynergize

  type:"ModifierSynergizeDamageClosestEnemy"
  @type:"ModifierSynergizeDamageClosestEnemy"

  fxResource: ["FX.Modifiers.ModifierSynergize", "FX.Modifiers.ModifierGenericDamage"]

  damageAmount: 0

  @createContextObject: (damageAmount, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onSynergize: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()
      bestAbsoluteDistance = 9999
      potentialTargets = []
      for potentialTarget in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
        if potentialTarget?.getIsActive()
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
        # choose randomly between all equally close enemies
        target = potentialTargets[@getGameSession().getRandomIntegerForExecution(potentialTargets.length)]
        damageAction = new DamageAction(this.getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(target)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierSynergizeDamageClosestEnemy
