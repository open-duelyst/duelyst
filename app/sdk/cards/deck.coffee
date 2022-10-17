SDKObject = require 'app/sdk/object'
Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
PlayerModifierReplaceCardModifier = require 'app/sdk/playerModifiers/playerModifierReplaceCardModifier'
PlayerModifierCannotReplace = require 'app/sdk/playerModifiers/playerModifierCannotReplace'
_ = require 'underscore'

class Deck extends SDKObject

  numCardsReplacedThisTurn: 0 # counter of card replacements player has made, reset each turn
  drawPile: null # record of card indices still available to draw
  hand: null # record of card indices in hand
  ownerId: null

  constructor: (gameSession, ownerId) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @drawPile = []
    @hand = []
    @hand.length = CONFIG.MAX_HAND_SIZE
    @setOwnerId(ownerId)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.cachedCards = null
    p.cachedCardsExcludingMissing = null
    p.cachedCardsInHand = null
    p.cachedCardsInHandExcludingMissing = null
    return p

  # region GETTERS / SETTERS

  setOwnerId: (val) ->
    @ownerId = val

  getOwnerId: () ->
    return @ownerId

  getOwner: () ->
    return @getGameSession().getPlayerById(@ownerId)

  setDrawPile: (val) ->
    @drawPile = val

  ###*
   * Returns list of card indices remaining in deck, i.e. cards that can still be drawn.
   * @returns {Array}
   ###
  getDrawPile: () ->
    return @drawPile

  ###*
   * Returns list of card indices remaining in deck, i.e. cards that can still be drawn, excluding missing cards.
   * @returns {Array}
   ###
  getDrawPileExcludingMissing: () ->
    drawPile = []
    for cardIndex in @drawPile
      if cardIndex? and @getGameSession().getCardByIndex(cardIndex)?
        drawPile.push(cardIndex)
    return drawPile

  ###*
   * Returns list of cards remaining in deck, i.e. cards that can still be drawn.
   * @returns {Array}
   ###
  getCardsInDrawPile: () ->
    @_private.cachedCards ?= @getGameSession().getCardsByIndices(@drawPile)
    return @_private.cachedCards

  ###*
   * Returns list of cards remaining in deck, i.e. cards that can still be drawn, excluding missing cards.
   * @returns {Array}
   ###
  getCardsInDrawPileExcludingMissing: () ->
    if !@_private.cachedCardsExcludingMissing?
      cards = @_private.cachedCardsExcludingMissing = []
      for cardIndex in @drawPile
        if cardIndex?
          card = @getGameSession().getCardByIndex(cardIndex)
          if card?
            cards.push(card)
    return @_private.cachedCardsExcludingMissing

  getNumCardsInDrawPile: () ->
    return @drawPile.length

  flushCachedCards: () ->
    @_private.cachedCards = null
    @_private.cachedCardsExcludingMissing = null
    @getOwner()?.flushCachedEventReceivingCards()

  ###*
   * Returns list of card indices in hand.
   * NOTE: may contain null values for empty slots!
   * @returns {Array}
   ###
  getHand: () ->
    return @hand

  ###*
   * Returns list of card indices in hand, excluding empty slots.
   * NOTE: does not retain hand index ordering!
   * @returns {Array}
   ###
  getHandExcludingMissing: () ->
    hand = []
    for cardIndex in @hand
      if cardIndex?
        hand.push(cardIndex)
    return hand

  ###*
   * Returns list of cards in hand.
   * NOTE: may contain null values for empty slots!
   * @returns {Array}
   ###
  getCardsInHand: () ->
    @_private.cachedCardsInHand ?= @getGameSession().getCardsByIndices(@hand)
    return @_private.cachedCardsInHand

  ###*
   * Returns list of cards in hand, excluding empty slots or missing cards.
   * NOTE: does not retain hand index ordering!
   * @returns {Array}
   ###
  getCardsInHandExcludingMissing: () ->
    if !@_private.cachedCardsInHandExcludingMissing?
      cards = @_private.cachedCardsInHandExcludingMissing = []
      for cardIndex in @hand
        if cardIndex?
          card = @getGameSession().getCardByIndex(cardIndex)
          if card?
            cards.push(card)
    return @_private.cachedCardsInHandExcludingMissing

  flushCachedCardsInHand: () ->
    @_private.cachedCardsInHand = null
    @_private.cachedCardsInHandExcludingMissing = null
    @getOwner()?.flushCachedEventReceivingCards()

  ###*
   * Returns a card index at an index in hand.
   * NOTE: may contain null values for empty slots!
   * @returns {Number|String}
   ###
  getCardIndexInHandAtIndex: (i) ->
    return @hand[i]

  ###*
   * Returns a card at an index in hand.
   * NOTE: may contain null values for empty slots!
   * @returns {Card}
   ###
  getCardInHandAtIndex: (i) ->
    return @getGameSession().getCardByIndex(@getCardIndexInHandAtIndex(i))

  ###*
   * Returns the index of the first empty slot in hand.
   * @returns {Number}
   ###
  getFirstEmptySpaceInHand: () ->
    for i in [0...CONFIG.MAX_HAND_SIZE]
      if !@hand[i]? then return i
    return null # if no emtpy space in hand, return null

  ###*
   * Returns the number of cards in hand.
   * @returns {Number}
   ###
  getNumCardsInHand: () ->
    numCards = 0
    for i in [0...CONFIG.MAX_HAND_SIZE]
      if @hand[i]? then numCards++
    return numCards

  # endregion GETTERS / SETTERS

  # region ACTIONS

  # actions that modify state
  actionDrawCard: (optionalCardIndex=null)->
    action = @getGameSession().createActionForType(DrawCardAction.type)
    action.setOwnerId(@getOwnerId())
    if optionalCardIndex # set when a specific card should be drawn
      action.setCardIndexFromDeck(optionalCardIndex)
    return action

  actionsDrawCardsToRefillHand: ()->
    actions = []
    # return enough actions to refill hand
    for i in [0...CONFIG.MAX_HAND_SIZE]
      # only return an action at hand space if space is empty
      if !@hand[i]? then actions.push(@actionDrawCard())
    return actions

  # returns a number of draw card actions needed for end turn card draw
  actionsDrawNewCards: ()->
    actions = []
    # number of card draw actions we need to create (default set by config value)
    numRemainingActions = CONFIG.CARD_DRAW_PER_TURN
    # check player modifiers that change number of cards drawn at end of turn
    cardDrawChange = 0
    for cardDrawModifier in @getOwner().getPlayerModifiersByClass(PlayerModifierCardDrawModifier)
      cardDrawChange += cardDrawModifier.getCardDrawChange()
    numRemainingActions += cardDrawChange # final number of actions to create after modifiers

    # first try to re-fill empty slots in action bar with cards
    for i in [0...CONFIG.MAX_HAND_SIZE]
      if numRemainingActions is 0 # stop producing draw card actions when per turn limit is reached
        break
      # only return an action at hand space if space is empty
      if !@hand[i]?
        actions.push(@actionDrawCard())
        numRemainingActions--

    # if action bar is already full but we haven't drawn enough cards yet
    # then burn cards from deck (draw and immediately discard without playing)
    while numRemainingActions > 0 and !@getGameSession().getIsDeveloperMode()
      actions.push(@actionDrawCard())
      numRemainingActions--

    return actions

  actionPutCardInDeck: (cardDataOrIndex)->
    ownerId = @getOwnerId()
    action = new PutCardInDeckAction(@getGameSession(), ownerId, cardDataOrIndex)
    action.setOwnerId(ownerId)
    return action

  # endregion ACTIONS

  # region ADD

  ###*
   * Puts card index into the deck.
   * NOTE: use GameSession.applyCardToDeck instead of calling this directly.
   * @param {Number|String} cardIndex
   ###
  putCardIndexIntoDeck: (cardIndex) ->
    if cardIndex? and !_.contains(@drawPile, cardIndex)
      @drawPile.push(cardIndex)
      @flushCachedCards()

  ###*
   * Puts card index into the hand at the first open slot.
   * NOTE: use GameSession.applyCardToHand instead of calling this directly.
   * @param {Number|String} cardIndex
   ###
  putCardIndexInHand: (cardIndex) ->
    indexOfCardInHand = null

    if cardIndex?
      # find first empty place in hand, and insert card there
      for i in [0...CONFIG.MAX_HAND_SIZE]
        if !@hand[i]?
          @hand[i] = cardIndex
          indexOfCardInHand = i
          @flushCachedCardsInHand()
          break

    return indexOfCardInHand

  ###*
   * Puts card index into the hand at a specified index.
   * NOTE: use GameSession.applyCardToHand instead of calling this directly.
   * @param {Number|String} cardIndex
   * @param {Number} indexOfCard
   ###
  putCardIndexInHandAtIndex: (cardIndex, indexOfCard) ->
    if cardIndex? and indexOfCard?
      @hand[indexOfCard] = cardIndex
      @flushCachedCardsInHand()

  # endregion ADD

  # region REMOVE

  ###*
   * Removes card index from the deck.
   * NOTE: use GameSession.removeCardByIndexFromDeck instead of calling this directly.
   * @param {Number|String} cardIndex
   ###
  removeCardIndexFromDeck: (cardIndex) ->
    indexOfCard = null

    if cardIndex?
      # find card data by index match
      for existingCardIndex, i in @drawPile
        if existingCardIndex? and existingCardIndex == cardIndex
          indexOfCard = i
          @drawPile.splice(i, 1)
          @flushCachedCards()
          break

    return indexOfCard

  ###*
   * Removes card index from the hand.
   * NOTE: use GameSession.removeCardByIndexFromHand instead of calling this directly.
   * @param {Number|String} cardIndex
   ###
  removeCardIndexFromHand: (cardIndex) ->
    indexOfCard = null

    if cardIndex?
      # find card data by index match
      for existingCardIndex, i in @hand
        if existingCardIndex? and existingCardIndex == cardIndex
          indexOfCard = i
          @hand[i] = null
          @flushCachedCardsInHand()
          break

    return indexOfCard

  # endregion REMOVE

  # region REPLACE

  setNumCardsReplacedThisTurn: (numCardsReplacedThisTurn) ->
    @numCardsReplacedThisTurn = numCardsReplacedThisTurn

  getNumCardsReplacedThisTurn: () ->
    return @numCardsReplacedThisTurn

  getCanReplaceCardThisTurn: () ->
    if @getOwner().getPlayerModifiersByClass(PlayerModifierCannotReplace).length > 0
      return false
    else
      replacesAllowedThisTurn = CONFIG.MAX_REPLACE_PER_TURN
      replaceCardChange = 0
      for replaceCardModifier in @getOwner().getPlayerModifiersByClass(PlayerModifierReplaceCardModifier)
        replaceCardChange += replaceCardModifier.getReplaceCardChange()
      replacesAllowedThisTurn += replaceCardChange # final number of cards allowed to be replaced
      return @numCardsReplacedThisTurn < replacesAllowedThisTurn and @drawPile.length > 0

  # endregion REPLACE

  # region SERIALIZATION

  deserialize: (data) ->
    UtilsJavascript.fastExtend(@, data)

    # ensure hand is correct length
    @hand.length = CONFIG.MAX_HAND_SIZE

  # endregion SERIALIZATION

module.exports = Deck
