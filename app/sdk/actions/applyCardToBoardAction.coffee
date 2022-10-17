CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action =     require './action'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
Abstract action to apply a card to the board. Do not use directly.
###

class ApplyCardToBoardAction extends Action

  @type:"ApplyCardToBoardAction"
  cardDataOrIndex: null # card data or index for new card
  cardOwnedByGameSession: false # card being applied may need to be owned by gamesession (a mana tile for example)
  isValidApplication: false # whether application was valid

  constructor: (gameSession, ownerId, x, y, cardDataOrIndex, cardOwnedByGameSession=false) ->
    @type ?= ApplyCardToBoardAction.type
    @targetPosition = {x:x,y:y}

    if cardDataOrIndex?
      # copy data so we don't modify anything unintentionally
      if _.isObject(cardDataOrIndex)
        @cardDataOrIndex = UtilsJavascript.fastExtend({}, cardDataOrIndex)
      else
        @cardDataOrIndex = cardDataOrIndex

    super(gameSession)

    # has to be done after super()
    @ownerId = ownerId + ""
    @cardOwnedByGameSession = cardOwnedByGameSession

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedCard = null

    return p

  isRemovableDuringScrubbing: () ->
    return false

  getManaCost: () ->
    return 0

  ###*
   * Sets the card data or index used to create a card.
   ###
  setCardDataOrIndex: (val) ->
    @cardDataOrIndex = val

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
      if @_private.cachedCard?
        if !@cardOwnedByGameSession
          @_private.cachedCard.setOwnerId(@getOwnerId())
    return @_private.cachedCard

  ###*
   * Explicitly sets the card.
   * NOTE: This card reference is not serialized and will not be preserved through deserialize/rollback.
   ###
  setCard: (card) ->
    @_private.cachedCard = card

  getSource:() ->
    source = super()
    if !source?
      # check parent actions
      parentAction = @getResolveParentAction()
      if parentAction?
        @_private.source = parentAction.getSource()
    return source

  # target should always be the card we've applied to the board, so we'll alias getCard
  getTarget: @::getCard

  ###*
   * Returns whether the application of the card was valid.
   * NOTE: this will only return reliable values POST EXECUTION
   ###
  getIsValidApplication: () ->
    return @isValidApplication

  _execute: () ->
    super()

    # get the applying card
    card = @getCard()

    # force the target to match the card we're spawning
    @_private.target = card

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
    @isValidApplication = @getGameSession().applyCardToBoard(card, @targetPosition.x, @targetPosition.y, @cardDataOrIndex, @)

    # add post apply card data so we transmit the correct values to the clients
    if @getGameSession().getIsRunningAsAuthoritative() then @cardDataOrIndex = card.updateCardDataPostApply(@cardDataOrIndex)

    # increment played cards for the player
    if @isValidApplication and !card.isOwnedByGameSession()
      if CardType.getIsUnitCardType(card.getType())
        card.getOwner().totalMinionsSpawned++
      else if CardType.getIsSpellCardType(card.getType())
        card.getOwner().totalSpellsCast++

  scrubSensitiveData: (actionData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
    # transform card as needed
    card = @getCard()
    if card? and card.isHideable(scrubFromPerspectiveOfPlayerId, forSpectator)
      hiddenCard = card.createCardToHideAs()
      actionData.cardDataOrIndex = hiddenCard.createCardData()
    return actionData

module.exports = ApplyCardToBoardAction
