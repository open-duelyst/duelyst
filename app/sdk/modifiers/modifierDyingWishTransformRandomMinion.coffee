ModifierDyingWish = require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'

class ModifierDyingWishTransformRandomMinion extends ModifierDyingWish

  type:"ModifierDyingWishTransformRandomMinion"
  @type:"ModifierDyingWishTransformRandomMinion"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericBuff"]

  minionToTransformTo: null
  includeAllies: true
  includeEnemies: true
  race: null

  @createContextObject: (minionToTransformTo, includeAllies=true, includeEnemies=true, race, options) ->
    contextObject = super(options)
    contextObject.minionToTransformTo = minionToTransformTo
    contextObject.includeAllies = includeAllies
    contextObject.includeEnemies = includeEnemies
    contextObject.race = race
    return contextObject

  onDyingWish: (action) ->

    if @minionToTransformTo?
      potentialUnits = []
      # find all potential minions
      for unit in @getGameSession().getBoard().getUnits()
        if unit?
          if @includeAllies
            if unit.getIsSameTeamAs(@getCard()) and !unit.getIsGeneral() and @getGameSession().getCanCardBeScheduledForRemoval(unit) and (!(@race?) or unit.getBelongsToTribe(@race))
              potentialUnits.push(unit)

          if @includeEnemies
            if !unit.getIsSameTeamAs(@getCard()) and !unit.getIsGeneral() and @getGameSession().getCanCardBeScheduledForRemoval(unit) and (!(@race?) or unit.getBelongsToTribe(@race))
              potentialUnits.push(unit)

      # if we found at least one minion on the board
      if potentialUnits.length > 0
        # pick one
        existingEntity = potentialUnits[@getGameSession().getRandomIntegerForExecution(potentialUnits.length)]
        targetPosition = existingEntity.getPosition()

        # remove it
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
        removeOriginalEntityAction.setTarget(existingEntity)
        @getGameSession().executeAction(removeOriginalEntityAction)

        #transform it
        if existingEntity?
          cardData = @minionToTransformTo
          cardData.additionalInherentModifiersContextObjects ?= []
          cardData.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(existingEntity.getExhausted(), existingEntity.getMovesMade(), existingEntity.getAttacksMade()))
          spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), @getCard().getOwnerId(), targetPosition.x, targetPosition.y, cardData)
          @getGameSession().executeAction(spawnEntityAction)

module.exports = ModifierDyingWishTransformRandomMinion
