Action = require './action'

class RemoveCardFromDeckAction extends Action

  @type:"RemoveCardFromDeckAction"

  targetPlayerId: null
  cardIndex: null

  constructor: (gameSession, cardIndex, targetPlayerId) ->
    @type ?= RemoveCardFromDeckAction.type
    super(gameSession)

    @cardIndex = cardIndex
    @targetPlayerId = targetPlayerId

  _execute: () ->
    super()

    if @cardIndex?
      deck = @getGameSession().getPlayerById(@targetPlayerId).getDeck()
      @getGameSession().removeCardByIndexFromDeck(deck, @cardIndex, @getGameSession().getCardByIndex(@cardIndex), @)

  getCardIndex: () ->
    return @cardIndex

  getTargetPlayerId: () ->
    return @targetPlayerId

module.exports = RemoveCardFromDeckAction
