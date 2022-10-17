SDKObject = require './object'
Logger =           require 'app/common/logger'
CONFIG =          require 'app/common/config'
EVENTS =          require 'app/common/event_types'
UtilsJavascript =          require 'app/common/utils/utils_javascript'
ActionStateRecord =          require 'app/common/actionStateRecord'
Deck =             require './cards/deck'
CardType =             require './cards/cardType'
EndFollowupAction =         require './actions/endFollowupAction'
PlayCardAction =         require './actions/playCardAction'
PlayCardFromHandAction =         require './actions/playCardFromHandAction'
PlaySignatureCardAction =         require './actions/playSignatureCardAction'
ResignAction =         require './actions/resignAction'
DrawStartingHandAction =   require './actions/drawStartingHandAction'
ReplaceCardFromHandAction =   require './actions/replaceCardFromHandAction'
GenerateSignatureCardAction = require './actions/generateSignatureCardAction'
ActivateSignatureCardAction = require './actions/activateSignatureCardAction'
PlayerModifier = require './playerModifiers/playerModifier'
PlayerModifierManaModifier = require './playerModifiers/playerModifierManaModifier'
PlayerModifierSignatureCardAlwaysReady = require './playerModifiers/playerModifierSignatureCardAlwaysReady'
_ = require 'underscore'

class Player extends SDKObject

  deck: null
  hasResigned: false
  hasStartingHand: false
  isCurrentPlayer: false
  isRanked: false
  rank: null
  isWinner: false
  lastMaximumMana: null
  lastActionTakenAt: null # used by server to account for turn timer
  lastRemainingMana: null
  maximumMana: null
  playerId: null
  remainingMana: null
  signatureCardIndices: null
  signatureCardActive: false # signature card can only be cast when it is active
  startingMana: null
  totalDamageDealt: 0
  totalDamageDealtToGeneral: 0
  totalMinionsKilled: 0
  totalSpellsCast: 0
  totalSpellsPlayedFromHand: 0
  totalMinionsPlayedFromHand: 0
  totalMinionsSpawned: 0
  username: null

  constructor: (gameSession,playerId,username) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @setPlayerId(playerId)
    @setUsername(username)
    @setStartingMana(0)
    @signatureCardIndices = []

    # initialize stats counters
    @totalDamageDealt = 0
    @totalDamageDealtToGeneral = 0
    @totalMinionsKilled = 0
    @totalMinionsPlayedFromHand = 0
    @totalMinionsSpawned = 0
    @totalSpellsCast = 0
    @totalSpellsPlayedFromHand = 0

    # initialize deck
    @deck = new Deck(@getGameSession(), @getPlayerId())




  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.eventReceivingCardsOnBoard = []
    p.actionStateRecord = null
    p.cachedEventReceivingCards = null
    p.cachedReferenceSignatureCard = null

    return p

  ###*
   * Flushes all cached data.
   ###
  flushAllCachedData: () ->
    @flushAllCachedCards()
    @flushCachedEventReceivingCards()

  ###*
   * Flushes all cached cards.
   ###
  flushAllCachedCards: () ->
    @deck.flushCachedCardsInHand()
    @deck.flushCachedCards()

  # region EVENTS

  ###*
   * SDK event handler. Do not call this method manually.
   ###
  onEvent: (event) ->
    eventType = event.type
    if eventType == EVENTS.terminate or eventType == EVENTS.before_deserialize
      @_onTerminate(event)
    else if eventType == EVENTS.end_turn
      @_onEndTurn(event)
    else if eventType == EVENTS.update_cache_action or eventType == EVENTS.update_cache_step
      @getActionStateRecord()?.onStateRecordingActionEvent(event)

    # send to my cards
    cards = @getEventReceivingCards()
    for card in cards
      card.onEvent(event)
      #if @getGameSession().getIsBufferingEvents() and event.isBufferable then break

  ###*
   * Returns the event receiving cards for a player.
   ###
  getEventReceivingCards: () ->
    # this has to be its own array so that it cannot be modified mid event loop
    if !@_private.cachedEventReceivingCards?
      @_private.cachedEventReceivingCards = [].concat(
        @getEventReceivingCardsOnBoard(),
        @getDeck().getCardsInHandExcludingMissing(),
        @getDeck().getCardsInDrawPileExcludingMissing()
      )

      currentSignatureCard = @getCurrentSignatureCard()
      if currentSignatureCard?
        @_private.cachedEventReceivingCards.push(currentSignatureCard)

    return @_private.cachedEventReceivingCards

  ###*
   * Flushes the cached event receiving cards.
   ###
  flushCachedEventReceivingCards: () ->
    @_private.cachedEventReceivingCards = null

  addEventReceivingCardOnBoard: (card) ->
    index = _.indexOf(@_private.eventReceivingCardsOnBoard, card)
    if index == -1
      @_private.eventReceivingCardsOnBoard.push(card)
      @flushCachedEventReceivingCards()

  removeEventReceivingCardOnBoard: (card) ->
    index = _.indexOf(@_private.eventReceivingCardsOnBoard, card)
    if index != -1
      @_private.eventReceivingCardsOnBoard.splice(index, 1)
      @flushCachedEventReceivingCards()

  moveEventReceivingCardToFront: (card) ->
    index = _.indexOf(@_private.eventReceivingCardsOnBoard, card)
    if index != -1
      @_private.eventReceivingCardsOnBoard.splice(index, 1)
      @_private.eventReceivingCardsOnBoard.unshift(card)

  getEventReceivingCardsOnBoard: () ->
    return @_private.eventReceivingCardsOnBoard

  # endregion EVENTS

  # region GETTERS / SETTERS

  getLogName: () ->
    return @getUsername() + "[" + @getPlayerId() + "]"

  setUsername: (val) ->
    @username = val

  getUsername: () ->
    return @username

  setPlayerId: (val) ->
    @playerId = val + ""
    if @deck? then @deck.setOwnerId(@getPlayerId())

  getPlayerId: () ->
    return @playerId + ""

  setDeck: (val) ->
    @deck = val
    if @deck? then @deck.setOwnerId(@getPlayerId())

  getDeck: () ->
    return @deck

  setLastActionTakenAt: (val) ->
    @lastActionTakenAt = val

  getLastActionTakenAt: () ->
    return @lastActionTakenAt

  setIsCurrentPlayer: (isCurrentPlayer) ->
    @isCurrentPlayer = isCurrentPlayer

  getIsCurrentPlayer: () ->
    return @isCurrentPlayer

  setIsRanked: (val) ->
    @isRanked = val

  getIsRanked: () ->
    return @isRanked

  setRank: (val)->
    @rank = val

  setIsWinner: (val) ->
    @isWinner = val

  getIsWinner: () ->
    return @isWinner

  setHasStartingHand: (hasStartingHand) ->
    @hasStartingHand = hasStartingHand

  getHasStartingHand: () ->
    return @hasStartingHand

  ownsCard: (card) ->
    return @getPlayerId() == card.getOwnerId()

  getStartingMana: () ->
    return @startingMana

  setStartingMana: (val) ->
    @startingMana = @remainingMana = @maximumMana = @lastRemainingMana = @lastMaximumMana = val

  getRemainingMana: () ->
    mana = @remainingMana
    for manaModifier in @getActivePlayerModifiersByClass(PlayerModifierManaModifier) by -1
      mana += manaModifier.bonusMana

    return Math.max(0, mana)

  getBaseRemainingMana: () ->
    return @remainingMana

  getLastRemainingMana: () ->
    return @lastRemainingMana

  getMaximumMana: () ->
    mana = @maximumMana
    for manaModifier in @getActivePlayerModifiersByClass(PlayerModifierManaModifier) by -1
      mana += manaModifier.bonusMana

    # player can never have more than MAX_MANA cores
    if mana > CONFIG.MAX_MANA
      mana = CONFIG.MAX_MANA

    return Math.max(0, mana)

  getBaseMaximumMana: () ->
    return @maximumMana

  getLastMaximumMana: () ->
    return @lastMaximumMana

  getPlayerModifiers: () ->
    playerModifiers = []
    general = @getGameSession().getGeneralForPlayerId(@playerId)
    modifiers = general?.getModifiers()
    if modifiers?
      for modifier in modifiers
        if modifier instanceof PlayerModifier
          playerModifiers.push(modifier)
    return playerModifiers

  getActivePlayerModifiers:() ->
    playerModifiers = []
    general = @getGameSession().getGeneralForPlayerId(@playerId)
    modifiers = general?.getModifiers()
    if modifiers?
      for modifier in modifiers
        if modifier instanceof PlayerModifier and modifier.getIsActive()
          playerModifiers.push(modifier)
    return playerModifiers

  getPlayerModifiersByType:(type) ->
    modifiers = []
    for m in @getPlayerModifiers()
      if m.getType() == type then modifiers.push(m)
    return modifiers

  getActivePlayerModifiersByType:(type) ->
    modifiers = []
    for m in @getPlayerModifiers()
      if m.getType() == type and m.getIsActive() then modifiers.push(m)
    return modifiers

  getPlayerModifiersByClass:(cls) ->
    modifiers = []
    for m in @getPlayerModifiers()
      if m instanceof cls then modifiers.push(m)
    return modifiers

  getActivePlayerModifiersByClass:(cls) ->
    modifiers = []
    for m in @getPlayerModifiers()
      if m instanceof cls and m.getIsActive() then modifiers.push(m)
    return modifiers

  # endregion GETTERS / SETTERS

  # region SIGNATURE CARD

  ###*
   * Get card data for signature from the player's General.
   * @returns {Object}
   ###
  getSignatureCardData: () ->
    general = @getGameSession().getGeneralForPlayerId(@getPlayerId())
    return general?.getSignatureCardData()

  ###*
   * Get reference card for signature from the player's General.
   * NOTE: this card is never used in game and is only for reference!
   * @returns {Card}
   ###
  getReferenceSignatureCard: () ->
    if !@_private.cachedReferenceSignatureCard?
      @_private.cachedReferenceSignatureCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@getSignatureCardData())
      if @_private.cachedReferenceSignatureCard?
        @_private.cachedReferenceSignatureCard.setOwnerId(@getPlayerId())
    return @_private.cachedReferenceSignatureCard

  getIsSignatureCardActive: () ->
    return @signatureCardActive or @getIsSignatureCardAlwaysReady()

  setIsSignatureCardActive: (isActive) ->
    @signatureCardActive = isActive

  ###*
   * Flushes the cached reference card for signature so that the next call will regenerate the card.
   ###
  flushCachedReferenceSignatureCard: () ->
    @_private.cachedReferenceSignatureCard = null

  ###*
   * Add signature card to list of current signature cards.
   * @param {Card}
   ###
  addSignatureCard: (card) ->
    cardIndex = card.getIndex()
    if !cardIndex?
      Logger.module("SDK").error @.getGameSession().gameId, "Player.addSignatureCard #{card.getName()} must be added through game session and not directly to player!"

    # store card index
    if _.indexOf(@signatureCardIndices, cardIndex) == -1
      @signatureCardIndices.push(cardIndex)

    # flush reference card as needed
    currentSignatureCard = @getCurrentSignatureCard()
    referenceSignatureCard = @getReferenceSignatureCard()
    if currentSignatureCard? and referenceSignatureCard? and currentSignatureCard.getId() != referenceSignatureCard.getId()
      @flushCachedReferenceSignatureCard()

  ###*
   * Remove a signature card from the list of current signature cards.
   * @param {Card}
   * @returns {Number|null} index of card in list if removed, otherwise null
   ###
  removeSignatureCard: (card) ->
    cardIndex = card.getIndex()
    if !cardIndex?
      Logger.module("SDK").error @.getGameSession().gameId, "Player.removeSignatureCard #{card.getName()} must be removed through game session and not directly to player!"

    # store card index
    index = _.indexOf(@signatureCardIndices, cardIndex)
    if index >= 0
      @signatureCardIndices.splice(index, 1)

    return index

  ###*
   * Get indices of signature cards, if any exist.
   * @returns {Array}
   ###
  getSignatureCardIndices: () ->
    return @signatureCardIndices

  ###*
   * Get current signature cards, if any exist.
   * @returns {Card|null}
   ###
  getSignatureCards: () ->
    return @getGameSession().getCardsByIndices(@getSignatureCardIndices())

  ###*
   * Get index of current signature card, if any exists.
   * @returns {Number|null}
   ###
  getCurrentSignatureCardIndex: () ->
    return @signatureCardIndices[0]

  ###*
   * Get current signature card, if any exists.
   * @returns {Card|null}
   ###
  getCurrentSignatureCard: () ->
    return @getGameSession().getCardByIndex(@getCurrentSignatureCardIndex())

  ###*
   * Determine if player's Signature Card should be ready every turn, regardless of current "timer"
   * @returns {Boolean}
   ###
  getIsSignatureCardAlwaysReady: () ->
    return @getGameSession().getIsSignatureCardAlwaysReady() or @getGameSession().getGeneralForPlayerId(@getPlayerId()).hasModifierClass(PlayerModifierSignatureCardAlwaysReady)

  # end region SIGNATURE CARD

  # region ACTIONS

  actionDrawStartingHand: (mulliganIndices) ->
    drawStartingHandAction = new DrawStartingHandAction(@getGameSession(),@getPlayerId(),mulliganIndices)
    return drawStartingHandAction

  actionPlayCardFromHand: (indexOfCardInHand,tileX,tileY) ->
    playCardAction = new PlayCardFromHandAction(@getGameSession(), @getPlayerId(), tileX, tileY, indexOfCardInHand)
    return playCardAction

  actionPlaySignatureCard: (tileX,tileY) ->
    signatureCard = @getCurrentSignatureCard()
    if signatureCard?
      playCardAction = new PlaySignatureCardAction(@getGameSession(), @getPlayerId(), tileX, tileY, signatureCard.getIndex())
      return playCardAction

  actionPlayFollowup: (followupCard, tileX, tileY) ->
    playCardAction = new PlayCardAction(@getGameSession(), @getPlayerId(), tileX, tileY, followupCard.createNewCardData())
    playCardAction.setSource(followupCard.getParentCard())
    playCardAction.setSourcePosition(followupCard.getFollowupSourcePosition())
    return playCardAction

  actionEndFollowup: () ->
    endFollowupAction = new EndFollowupAction(@getGameSession(), @getPlayerId())
    return endFollowupAction

  actionReplaceCardFromHand: (indexOfCardInHand) ->
    replaceCardAction = new ReplaceCardFromHandAction(@getGameSession(), @getPlayerId(), indexOfCardInHand)
    return replaceCardAction

  actionGenerateSignatureCard: () ->
    signatureCardData = @getSignatureCardData()
    if signatureCardData?
      generateSignatureCardAction = new GenerateSignatureCardAction(@getGameSession(), @getPlayerId(), signatureCardData)
      return generateSignatureCardAction

  actionActivateSignatureCard: () ->
    signatureCardData = @getSignatureCardData()
    if signatureCardData?
      activateSignatureCardAction = new ActivateSignatureCardAction(@getGameSession(), @getPlayerId())
      return activateSignatureCardAction

  actionResign: () ->
    resignAction = new ResignAction(@getGameSession())
    resignAction.setOwnerId(@getPlayerId())
    general = @getGameSession().getGeneralForPlayerId(@getPlayerId())
    resignAction.setSource(general)
    resignAction.setTarget(general)
    return resignAction

  # endregion ACTIONS

  # region ACTION STATE RECORD

  ###*
   * Syncs this player to the latest game state.
   ###
  syncState: () ->
    @getActionStateRecord()?.recordStateAtLastActionRecorded()

  getActionStateRecord: () ->
    if !@_private.actionStateRecord? and @getGameSession().getIsRunningOnClient()
      @_private.actionStateRecord = new ActionStateRecord()
      @startActionStateRecord()
    return @_private.actionStateRecord

  startActionStateRecord: () ->
    actionStateRecord = @getActionStateRecord()
    if actionStateRecord?
      # get properties to record
      propertiesToRecord = @propertiesForActionStateRecord()
      if propertiesToRecord? and Object.keys(propertiesToRecord).length > 0
        # start recording if at least 1 property
        actionStateRecord.setupToRecordStateOnEvent(EVENTS.update_cache_action, propertiesToRecord)
        actionStateRecord.setupToRecordStateOnEvent(EVENTS.update_cache_step, propertiesToRecord)

  terminateActionStateRecord: () ->
    @getActionStateRecord()?.teardownRecordingStateOnAllEvents()

  propertiesForActionStateRecord: () ->
    # return map of property names to functions
    # where each function returns a value for the property name
    return {
      numCards: (() -> return @getDeck().getNumCardsInDrawPile() ).bind(@)
      numCardsInHand: (() -> return @getDeck().getNumCardsInHand() ).bind(@)
      remainingMana: (() -> return @getRemainingMana() ).bind(@)
      maximumMana: (() -> return @getMaximumMana() ).bind(@)
    }

  # endregion ACTION STATE RECORD

  # region EVENTS

  _onTerminate: () ->
    # this method is automatically called when this object will never be used again
    @terminateActionStateRecord()

  _onEndTurn: () ->
    if @getIsCurrentPlayer()
      # reset replace counter
      @deck.setNumCardsReplacedThisTurn(0)

  # endregion EVENTS

  # region SERIALIZATION

  deserialize: (data) ->
    # Write the deserialized data
    UtilsJavascript.fastExtend(@,data)

    # deserialize deck
    @deck = new Deck(@getGameSession(), @getPlayerId())
    @deck.deserialize(data.deck)

  postDeserialize: () ->
    # flush all cached data
    @flushAllCachedData()

  # endregion SERIALIZATION

module.exports = Player
