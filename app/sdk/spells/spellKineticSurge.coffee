SpellApplyPlayerModifiers = require './spellApplyPlayerModifiers'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'

class SpellKineticSurge extends SpellApplyPlayerModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      super(board,x,y,sourceAction) # apply player modifier to General

      # find all summon actions that summoned a friendly unit this turn
      summonActions = []
      actions = []
      for step in @getGameSession().getCurrentTurn().getSteps()
        if step isnt @getGameSession().getExecutingStep() # don't need to check current step since player modifier will catch summons on this step
          actions = step.getAction().getFlattenedActionTree()
          for action in actions
            if action instanceof ApplyCardToBoardAction and action.getTarget().getType() is CardType.Unit and action.getTarget().getOwnerId() is @getOwnerId()
              summonActions.push(action)

      # and apply modifiers to all friendly units summoned this turn as well
      for action in summonActions
        # but ignore transforms
        if !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)
          targetUnit = action.getTarget()
          if targetUnit?
            for modifierContextObject in @targetModifiersContextObjects[0].modifiersContextObjects
              @getGameSession().applyModifierContextObject(modifierContextObject, targetUnit)


module.exports = SpellKineticSurge
