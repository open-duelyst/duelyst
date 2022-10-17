ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'

class ModifierEndTurnWatchTransformNearbyEnemies extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchTransformNearbyEnemies"
  @type:"ModifierEndTurnWatchTransformNearbyEnemies"

  @modifierName:"End Turn Watch Transform Enemies"
  @description:"At the end of your turn, transform nearby enemies"

  cardToBecome: null

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  @createContextObject: (cardToBecome, options) ->
    contextObject = super(options)
    contextObject.cardToBecome = cardToBecome
    return contextObject

  onTurnWatch: (action) ->

    opponentId = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId()
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      if !entity.getIsGeneral()

        # remove it
        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
        removeOriginalEntityAction.setTarget(entity)
        @getGameSession().executeAction(removeOriginalEntityAction)

        # and turn it into a Panddo
        if entity?
          cardData = @cardToBecome
          cardData.additionalInherentModifiersContextObjects ?= []
          cardData.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(entity.getExhausted(), entity.getMovesMade(), entity.getAttacksMade()))
          spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), opponentId, entity.getPosition().x, entity.getPosition().y, cardData)
          @getGameSession().executeAction(spawnEntityAction)

module.exports = ModifierEndTurnWatchTransformNearbyEnemies
