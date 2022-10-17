Logger = require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action = require './action'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class PutCardInDeckAction extends Action

  @type:"PutCardInDeckAction"

  targetPlayerId: null
  cardDataOrIndex: null # card data or index for new card

  constructor: (gameSession, targetPlayerId, cardDataOrIndex) ->
    @type ?= PutCardInDeckAction.type
    @targetPlayerId = targetPlayerId

    if cardDataOrIndex?
      # copy data so we don't modify anything unintentionally
      if _.isObject(cardDataOrIndex)
        @cardDataOrIndex = UtilsJavascript.fastExtend({}, cardDataOrIndex)
      else
        @cardDataOrIndex = cardDataOrIndex

    super(gameSession)

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
   * @returns {Card}
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

  # target should always be the card we've put in deck, so we'll alias getCard
  getTarget: @::getCard

  _execute: () ->
    super()

    if @targetPlayerId? and @cardDataOrIndex?
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "PutCardOnTopOfDeckAction::execute"
      card = @getCard()
      deck = @getGameSession().getPlayerById(@targetPlayerId).getDeck()

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

      # apply the card through the game session
      @getGameSession().applyCardToDeck(deck, @cardDataOrIndex, card, @)

      # get post apply card data
      if @getGameSession().getIsRunningAsAuthoritative() then @cardDataOrIndex = card.updateCardDataPostApply(@cardDataOrIndex)

  scrubSensitiveData: (actionData,scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # scrub the card id and only retain the card index
    if forSpectator or actionData.ownerId != scrubFromPerspectiveOfPlayerId
      if actionData.cardDataOrIndex? and _.isObject(actionData.cardDataOrIndex)
        actionData.cardDataOrIndex = {id:-1, index: actionData.cardDataOrIndex.index}
    return actionData

module.exports = PutCardInDeckAction
