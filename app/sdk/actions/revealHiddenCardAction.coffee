Logger =     require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
Action =     require './action'
_ = require 'underscore'

###
Action to reveal a hidden card.
###

class RevealHiddenCardAction extends Action

  @type:"RevealHiddenCardAction"

  isDepthFirst: true # revealing hidden cards should always occur immediately

  cardData: null # card data for revealed card

  constructor: (gameSession, ownerId, cardData) ->
    @type ?= RevealHiddenCardAction.type

    if cardData?
      # copy data so we don't modify anything unintentionally
      @cardData = UtilsJavascript.fastExtend({}, cardData)

    super(gameSession)

    # has to be done after super()
    @ownerId = ownerId + ""

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.isValidReveal = false # whether reveal is valid (i.e. was card hidden on this game session?)

    return p

  isRemovableDuringScrubbing: () ->
    return false

  getManaCost: () ->
    return 0

  ###*
   * Sets the card data used to reveal card.
   ###
  setCardData: (val) ->
    @cardData = val

  ###*
   * Returns the card data used to reveal card.
   ###
  getCardData: () ->
    return @cardData

  ###*
   * Returns the card.
   * NOTE: This card may or may not be indexed if this method is called before this action is executed.
   ###
  getCard: () ->
    if !@_private.cachedCard?
      target = @getTarget()
      cardId = @cardData.id
      if target.getId() == cardId
        @_private.cachedCard = target
      else
        # generate/set card when target is different from revealed
        @_private.cachedCard = @getGameSession().createCardForIdentifier(cardId)
        if @_private.cachedCard?
          # copy properties from target
          for key in target.getCardDataKeysForCopy()
            # only set certain properties on card data if they differ from the prototype, i.e. they are not DEFAULTS
            # this is done by checking if this object has it's won property (different than prototype) or is using the prototype
            if target.hasOwnProperty(key)
              val = target[key]
              if _.isArray(val)
                @_private.cachedCard[key] = val.slice(0)
              else if _.isObject(val)
                @_private.cachedCard[key] = UtilsJavascript.fastExtend({}, val)
              else
                @_private.cachedCard[key] = val

          # apply card data
          @_private.cachedCard.applyCardData(@cardData)

          # don't hide revealed card during scrubbing
          @_private.cachedCard.setHideAsCardId(null)
    return @_private.cachedCard

  ###*
   * Explicitly sets the card.
   * NOTE: This card reference is not serialized and will not be preserved through deserialize/rollback.
   ###
  setCard: (card) ->
    @_private.cachedCard = card

  ###*
   * Returns whether the reveal of the card was valid.
   * NOTE: this will only return reliable values POST EXECUTION
   ###
  getIsValidReveal: () ->
    return @_private.isValidReveal

  _execute: () ->
    super()

    # get hidden card
    target = @getTarget()

    # check whether hidden card is different from revealed
    @_private.isValidReveal = target.getId() != @cardData.id
    if !@_private.isValidReveal
      # no need to reveal card
      # however, we should not hide target card during scrubbing
      target.setHideAsCardId(null)
    else
      # get revealed card
      card = @getCard()

      # no longer hide this card during scrubbing
      card.setHideAsCardId(null)

      # update actions that applied hidden card to locations
      applyCardToDeckAction = target.getAppliedToDeckByAction()
      if applyCardToDeckAction? then applyCardToDeckAction.setCard(card)
      applyCardToHandAction = target.getAppliedToHandByAction()
      if applyCardToHandAction? then applyCardToHandAction.setCard(card)
      applyCardToBoardAction = target.getAppliedToBoardByAction()
      if applyCardToBoardAction? then applyCardToBoardAction.setCard(card)
      applyCardToSignatureCardsAction = target.getAppliedToSignatureCardsByAction()
      if applyCardToSignatureCardsAction? then applyCardToSignatureCardsAction.setCard(card)

      # index revealed card
      @getGameSession()._indexCardAsNeeded(card)

module.exports = RevealHiddenCardAction
