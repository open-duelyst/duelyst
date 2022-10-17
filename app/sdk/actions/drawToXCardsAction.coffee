Action =     require './action'
GameStatus =   require 'app/sdk/gameStatus'
Logger =     require 'app/common/logger'

_ = require 'underscore'

class DrawToXCardsAction extends Action

  @type:"DrawToXCardsAction"

  cardCount:0

  constructor: (gameSession,ownerId) ->
    @type ?= DrawToXCardsAction.type
    super(gameSession)

    # has to be done after super()
    @ownerId = ownerId + ""

  setCardCount: (cardCountToDrawTo) ->
    @cardCount = cardCountToDrawTo

  _execute: () ->
    player = @getGameSession().getPlayerById(@getOwnerId())
    deck = player.getDeck()

    # draw enough cards to bring hand count to cardCount
    # if player does not have enough cards remaining in deck,
    # this will still draw X cards but will NOT draw cards forever
    neededCards = @cardCount - deck.getNumCardsInHand()
    if neededCards > 0
      for i in [0...neededCards]
        @getGameSession().executeAction(deck.actionDrawCard())


module.exports = DrawToXCardsAction
