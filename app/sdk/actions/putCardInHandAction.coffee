CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action =     require './action'
_ = require("underscore")

class PutCardInHandAction extends Action

  @type:"PutCardInHandAction"
  cardDataOrIndex: null # card data or index for new card
  indexOfCardInHand: null # optional index in hand to place card, if none provided will use first empty slot
  burnCard: false # if true, card will always be burned even if there is room left in hand

  constructor: (gameSession, ownerId, cardDataOrIndex, indexOfCardInHand=null) ->
    @type ?= PutCardInHandAction.type
    if cardDataOrIndex?
      # copy data so we don't modify anything unintentionally
      if _.isObject(cardDataOrIndex)
        @cardDataOrIndex = UtilsJavascript.fastExtend({}, cardDataOrIndex)
      else
        @cardDataOrIndex = cardDataOrIndex

    @indexOfCardInHand = indexOfCardInHand

    super(gameSession)

    # has to be done after super()
    @ownerId = ownerId + ""

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedCard = null

    return p

  isRemovableDuringScrubbing: () ->
    return false

  ###*
   * Returns the card data or index used to create card that will be applied.
   ###
  getCardDataOrIndex: () ->
    return @cardDataOrIndex

  ###*
   * Returns the card.
   * NOTE: This card may or may not be indexed if this method is called before this action is executed.
   ###
  getCard: () ->
    if !@_private.cachedCard?
      @_private.cachedCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@cardDataOrIndex)
      if @_private.cachedCard? then @_private.cachedCard.setOwnerId(@getOwnerId())
    return @_private.cachedCard

  ###*
   * Explicitly sets the card.
   * NOTE: This card reference is not serialized and will not be preserved through deserialize/rollback.
   ###
  setCard: (card) ->
    @_private.cachedCard = card

  # target should always be the card we've put in hand, so we'll alias getCard
  getTarget: @::getCard

  ###*
   * Returns index location in hand that this card was placed.
   * NOTE: this will only return reliable values POST EXECUTION
   ###
  getIndexOfCardInHand: () ->
    return @indexOfCardInHand

  ###*
   * Returns true if this card ended up being burned, false if card was put into hand
   * NOTE: this will only return reliable values POST EXECUTION
   ###
  getIsBurnedCard: () ->
    return @cardDataOrIndex? and !@indexOfCardInHand?

  _execute: () ->
    super()

    if @cardDataOrIndex?
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "PutCardInHandAction::execute"
      card = @getCard()
      deck = @getGameSession().getPlayerById(@getOwnerId()).getDeck()

      # regenerate card data so we transmit the correct values to the clients
      if @getGameSession().getIsRunningAsAuthoritative()
        if card.getIsFollowup()
          # followups should ignore incoming card data
          @cardDataOrIndex = card.createCardData()
        else
          # apply incoming card data before regenerating
          card.applyCardData(@cardDataOrIndex)
          @cardDataOrIndex = card.createCardData(@cardDataOrIndex)

        # flag card data as applied locally so that we don't reapply regenerated data for clients
        @cardDataOrIndex._hasBeenApplied = true

      if @burnCard
        # apply and immediagtely burn the card through the game session
        @indexOfCardInHand = @getGameSession().applyCardToHand(deck, @cardDataOrIndex, card, @indexOfCardInHand, @, true)
      else
        # apply the card through the game session
        @indexOfCardInHand = @getGameSession().applyCardToHand(deck, @cardDataOrIndex, card, @indexOfCardInHand, @)

      # get post apply card data
      if @getGameSession().getIsRunningAsAuthoritative() then @cardDataOrIndex = card.updateCardDataPostApply(@cardDataOrIndex)

  scrubSensitiveData: (actionData,scrubFromPerspectiveOfPlayerId, forSpectator) ->
    if actionData.ownerId != scrubFromPerspectiveOfPlayerId
      if actionData.cardDataOrIndex? and actionData.indexOfCardInHand? and _.isObject(actionData.cardDataOrIndex)
        # scrub the card id and only retain the card index
        # unless burned card (no index in hand), then don't scrub and reveal to both players
        actionData.cardDataOrIndex = {id:-1, index: actionData.cardDataOrIndex.index}
    return actionData

module.exports = PutCardInHandAction
