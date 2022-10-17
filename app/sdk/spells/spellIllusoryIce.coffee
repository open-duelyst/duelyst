Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'

class SpellIllusoryIce extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    originalEntity = @getGameSession().getBoard().getEntityAtPosition({x:x,y:y})
    entities = @getGameSession().getBoard().getEntitiesAroundEntity(originalEntity, CardType.Unit, 1)

    for entity in entities
      if entity? and !entity.getIsGeneral()
        position = entity.getPosition()
        ownerId = entity.getOwnerId()

        removeEntityAction = new RemoveAction(@getGameSession())
        removeEntityAction.setOwnerId(@getOwnerId())
        removeEntityAction.setTarget(entity)
        @getGameSession().executeAction(removeEntityAction)

        existingEntity = @getGameSession().getBoard().getCardAtPosition({x:x, y:y}, CardType.Unit)
        if existingEntity? and !@getGameSession().getBoard().getObstructionAtPositionForEntity(position, existingEntity)
          cardDataOrIndexToSpawn = existingEntity.createCloneCardData()
          cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
          cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(entity.getExhausted(), entity.getMovesMade(), entity.getAttacksMade()))
          spawnEntityAction = new PlayCardAsTransformAction(@getGameSession(), ownerId, position.x, position.y, cardDataOrIndexToSpawn)
          @getGameSession().executeAction(spawnEntityAction)

module.exports = SpellIllusoryIce
