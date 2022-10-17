CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
Analytics = require 'app/common/analytics'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Action =     require './action'
PutCardInHandAction = require './putCardInHandAction'
_ = require("underscore")

class ReplaceCardFromHandAction extends PutCardInHandAction

  @type:"ReplaceCardFromHandAction"
  replacedCardIndex: null # index of card replaced
  forcedReplace: false # if this is a forced replace, we won't count it against the player's normal replaces allowed per turn

  constructor: (gameSession, ownerId, indexOfCardInHand) ->
    @type ?= ReplaceCardFromHandAction.type
    super(gameSession, ownerId, null, indexOfCardInHand)

  _execute: () ->
    player = @getGameSession().getPlayerById(@getOwnerId())
    deck = player.getDeck()
    drawPile = deck.getDrawPile()

    if !@getIsForcedReplace()
      # increase replaced card count
      deck.setNumCardsReplacedThisTurn(deck.getNumCardsReplacedThisTurn() + 1)

    if @getGameSession().getIsRunningAsAuthoritative() and drawPile.length > 0
      # get replaced card before doing anything
      @replacedCardIndex = deck.getCardIndexInHandAtIndex(@indexOfCardInHand)

      # make a copy of indices
      indices = _.range(drawPile.length)

      # find first card from the top down that is different
      indexOfCardInDeck = null
      if @replacedCardIndex?
        replacedCard = @getGameSession().getCardByIndex(@replacedCardIndex)
        while !indexOfCardInDeck? and indices.length > 0
          # get next index
          if !@getGameSession().getAreDecksRandomized()
            index = indices.pop()
          else
            index = indices.splice(@getGameSession().getRandomIntegerForExecution(indices.length), 1)[0]

          # test whether card is valid to replace
          cardIndex = drawPile[index]
          if cardIndex != replacedCard.getIndex()
            potentialCard = @getGameSession().getCardByIndex(cardIndex)
            if potentialCard.getBaseCardId() != replacedCard.getBaseCardId()
              # replace with card of a different id
              indexOfCardInDeck = index

        # default to top of deck
        indexOfCardInDeck ?= drawPile.length - 1

        # get the id of the card replacing
        @cardDataOrIndex = drawPile[indexOfCardInDeck]

    # put replaced card back into deck
    @getGameSession().applyCardToDeck(deck, @replacedCardIndex, @getGameSession().getCardByIndex(@replacedCardIndex), @)

    # add the new card to hand
    super()

  getIsForcedReplace:() ->
    return @forcedReplace

module.exports = ReplaceCardFromHandAction
