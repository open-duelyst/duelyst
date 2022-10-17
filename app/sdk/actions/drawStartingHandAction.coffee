Action =     require './action'
GameStatus =   require 'app/sdk/gameStatus'
Logger =     require 'app/common/logger'
CONFIG =     require 'app/common/config'
UtilsGameSession =     require 'app/common/utils/utils_game_session'

_ = require 'underscore'

class DrawStartingHandAction extends Action

  @type:"DrawStartingHandAction"

  mulliganIndices:null
  mulliganedHandCardsData:null
  newHandCardsData:null

  constructor: (gameSession, ownerId, mulliganIndices) ->
    @type ?= DrawStartingHandAction.type
    super(gameSession)
    @mulliganIndices = mulliganIndices || []
    @mulliganedHandCardsData = []
    @newHandCardsData = []

    # has to be done after super()
    @ownerId = ownerId + ""

  isRemovableDuringScrubbing: () ->
    return false

  _execute: () ->
    player = @getGameSession().getPlayerById(@getOwnerId())
    deck = player.getDeck()
    needsStartingHand = !player.getHasStartingHand()
    player.setHasStartingHand(true)

    if @getGameSession().getIsRunningAsAuthoritative()
      # always reset data on server
      @mulliganedHandCardsData = []
      @newHandCardsData = []

      if @getGameSession().isNew() and needsStartingHand and @mulliganIndices.length > 0 and @mulliganIndices.length <= CONFIG.STARTING_HAND_REPLACE_COUNT
        #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "#{@.type}::execute -> computing starting hand. Mulligan indices [#{@mulliganIndices.toString()}]"
        # only allow draw starting hand for new game where this player does not yet have a starting hand
        hand = deck.getHand()
        drawPile = deck.getDrawPile()

        # get all mulliganed cards as card data
        # card data is necessary or else drawing the starting hand won't work for replays
        @newHandCardsData.length = hand.length
        for index in @mulliganIndices
          card = deck.getCardInHandAtIndex(index)
          if card? then @mulliganedHandCardsData.push(card.createCardData())

        if @mulliganedHandCardsData.length > 0
          # get all cards in deck to choose from
          cardIndicesToChooseFrom = drawPile.slice(0)

          # when not enough cards remaining in deck to replace mulligan
          # add all cards to mulligan back into deck
          if @mulliganedHandCardsData.length > cardIndicesToChooseFrom.length
            for mulliganedCardData in @mulliganedHandCardsData
              cardIndicesToChooseFrom.push(mulliganedCardData.index)
            @mulliganedHandCardsData.length = 0

          # choose cards for new hand
          if cardIndicesToChooseFrom.length > 0
            for index in @mulliganIndices
              # redraw next card
              if !@getGameSession().getAreDecksRandomized()
                indexInCards = cardIndicesToChooseFrom.length - 1
              else
                indexInCards = @getGameSession().getRandomIntegerForExecution(cardIndicesToChooseFrom.length)
              cardIndex = cardIndicesToChooseFrom[indexInCards]
              card = @getGameSession().getCardByIndex(cardIndex)
              @newHandCardsData[index] = card.createCardData()
              cardIndicesToChooseFrom.splice(indexInCards, 1)

    if @mulliganedHandCardsData.length > 0 and @newHandCardsData.length > 0
      # return mulliganed cards to deck
      for cardData in @mulliganedHandCardsData
        card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(cardData)
        @getGameSession().applyCardToDeck(deck, cardData, card, @)

      # apply new cards to hand
      for cardData, i in @newHandCardsData
        if cardData?
          card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(cardData)
          @getGameSession().applyCardToHand(deck, cardData, card, i, @)

  getMulliganIndices: () ->
    return @mulliganIndices

  scrubSensitiveData: (actionData,scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # scrub card ids and only retain card indices
    if actionData.ownerId != scrubFromPerspectiveOfPlayerId
      actionData.mulliganedHandCardsData = _.map(actionData.mulliganedHandCardsData, (cardData) -> return {id:-1, index: cardData.index})
      actionData.newHandCardsData = _.map(actionData.newHandCardsData, (cardData) -> if cardData? then return {id:-1, index: cardData.index} else return null)
    return actionData

module.exports = DrawStartingHandAction
