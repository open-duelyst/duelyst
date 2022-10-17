CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
PlayCardAction =     require './playCardAction'
CardType = require 'app/sdk/cards/cardType'

class PlayCardFromHandAction extends PlayCardAction

  @type:"PlayCardFromHandAction"
  indexOfCardInHand: null # index of card in player hand
  overrideCardData: false # flag set when card data is overriden to be another card (ex - sentinels play themselves to board as a generic sentinel card)
  # if we override the card data, we need to retain any mana cost change for the original card being played from hand
  # only used when overrideCardData is true
  overridenManaCost: null

  constructor: (gameSession, ownerId, x, y, handIndex) ->
    @type ?= PlayCardFromHandAction.type
    super(gameSession, ownerId, x, y)

    @indexOfCardInHand = handIndex

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.originalCard = null

    return p

  ###*
  * Explicitly sets the card to be played.
  * This can be used to swap a card being played from hand with another arbritrary card at execution time
  ###
  overrideCard: (card) ->
    @_private.originalCard = @getCard()
    @overridenManaCost = @getCard().getManaCost() # store original mana cost of this card
    @setCard(card)
    @overrideCardData = true # card to be played to board is NOT card being played from hand

  getLogName: ()->
    logName = super()
    logName += "_i[#{@indexOfCardInHand}]"
    return logName

  getManaCost: () ->
    if @overrideCardData
      return @overridenManaCost
    else
      card = @getCard()
      if card? then card.getManaCost() else super()

  ###*
   * Returns index location in hand that this card was placed.
   ###
  getIndexOfCardInHand: () ->
    return @indexOfCardInHand

  getCard: () ->
    if !@_private.cachedCard?
      if @getGameSession().getIsRunningAsAuthoritative()
        # playing a card from hand should never use existing card data
        @cardDataOrIndex = @getOwner().getDeck().getCardIndexInHandAtIndex(@indexOfCardInHand)
      else if @getOwnerId() == @getGameSession().getMyPlayerId() and !@cardDataOrIndex?
        # when my action, try to grab card from hand unless we have card data provided by server
        @_private.cachedCard = @getOwner().getDeck().getCardInHandAtIndex(@indexOfCardInHand)

    return super()

  _execute: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      if !@overrideCardData
        # playing a card from hand should never use existing card data (unless explicitly being overridden)
        @cardDataOrIndex = @getOwner().getDeck().getCardIndexInHandAtIndex(@indexOfCardInHand)

    if @overrideCardData # explicitly changing the card as it is played, so remove the old card from hand - not only when running as authoritative, must happen on client as well
      @getGameSession()._removeCardFromCurrentLocation(@getOwner().getDeck().getCardInHandAtIndex(@indexOfCardInHand), @getOwner().getDeck().getCardIndexInHandAtIndex(@indexOfCardInHand), @)
    # prototype method will handle applying the card to the board
    super()

    # stat tracking for cards played
    card = @getCard()
    if card?
      cardType = card.getType()
      if CardType.getIsUnitCardType(cardType)
        @getGameSession().getPlayerById(@getOwnerId()).totalMinionsPlayedFromHand++
      else if CardType.getIsSpellCardType(cardType)
        @getGameSession().getPlayerById(@getOwnerId()).totalSpellsPlayedFromHand++

module.exports = PlayCardFromHandAction
