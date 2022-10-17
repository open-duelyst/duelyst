ModifierKillWatchAndSurvive = require './modifierKillWatchAndSurvive'
Cards = require 'app/sdk/cards/cardsLookupComplete'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
RemoveCardFromHandAction = require 'app/sdk/actions/removeCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'

class ModifierKillWatchAndSurviveScarzig extends ModifierKillWatchAndSurvive

  type:"ModifierKillWatchAndSurviveScarzig"
  @type:"ModifierKillWatchAndSurviveScarzig"

  fxResource: ["FX.Modifiers.ModifierKillWatch"]

  @createContextObject: (options) ->
    contextObject = super(false, true, options)
    return contextObject

  onKillWatchAndSurvive: (action) ->
    super(action)

    deck = @getCard().getOwner().getDeck()
    for cardInHand, i in deck.getCardsInHand()
      if cardInHand? and cardInHand.getBaseCardId() == Cards.Neutral.Scarzig
        removeCardFromHandAction = new RemoveCardFromHandAction(@getGameSession(), i, @getOwnerId())
        @getGameSession().executeAction(removeCardFromHandAction)

        putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), {id: Cards.Neutral.BigScarzig})
        @getGameSession().executeAction(putCardInHandAction)

    for cardInDeck in deck.getCardsInDrawPile()
      if cardInDeck? and cardInDeck.getBaseCardId() == Cards.Neutral.Scarzig
        removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), cardInDeck.getIndex(), @getOwnerId())
        @getGameSession().executeAction(removeCardFromDeckAction)

        putCardInDeckAction = new PutCardInDeckAction(@getGameSession(), @getOwnerId(), {id: Cards.Neutral.BigScarzig})
        @getGameSession().executeAction(putCardInDeckAction)

    for unit in @getGameSession().getBoard().getUnits()
      if unit? and unit.getIsSameTeamAs(@getCard()) and !unit.getIsGeneral() and @getGameSession().getCanCardBeScheduledForRemoval(unit) and unit.getBaseCardId() == Cards.Neutral.Scarzig

        removeOriginalEntityAction = new RemoveAction(@getGameSession())
        removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
        removeOriginalEntityAction.setTarget(unit)
        @getGameSession().executeAction(removeOriginalEntityAction)

        cardData = {id: Cards.Neutral.BigScarzig}
        cardData.additionalInherentModifiersContextObjects ?= []
        cardData.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(unit.getExhausted(), unit.getMovesMade(), unit.getAttacksMade()))
        spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), @getCard().getOwnerId(), unit.getPosition().x, unit.getPosition().y, cardData)
        @getGameSession().executeAction(spawnEntityAction)

module.exports = ModifierKillWatchAndSurviveScarzig
