CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action =     require './action'
_ = require("underscore")

class GenerateSignatureCardAction extends Action

  @type:"GenerateSignatureCardAction"
  cardDataOrIndex: null # card data or index for new card

  constructor: (gameSession, ownerId, cardDataOrIndex) ->
    @type ?= GenerateSignatureCardAction.type
    if cardDataOrIndex?
      # copy data so we don't modify anything unintentionally
      if _.isObject(cardDataOrIndex)
        @cardDataOrIndex = UtilsJavascript.fastExtend({}, cardDataOrIndex)
      else
        @cardDataOrIndex = cardDataOrIndex

    super(gameSession)

    # has to be done after super()
    @ownerId = ownerId + ""

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedCard = null

    return p

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

  isRemovableDuringScrubbing: () ->
    return false

  _execute: () ->
    super()

    if @cardDataOrIndex?
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "GenerateSignatureCardAction::execute"
      card = @getCard()

      # remove all previous signature cards
      owner = card.getOwner()
      for existingCard in owner.getSignatureCards()
        @getGameSession().removeCardFromSignatureCards(existingCard, @)

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
      @getGameSession().applyCardToSignatureCards(card, @cardDataOrIndex, @)

      # get post apply card data
      if @getGameSession().getIsRunningAsAuthoritative() then @cardDataOrIndex = card.updateCardDataPostApply(@cardDataOrIndex)

module.exports = GenerateSignatureCardAction
