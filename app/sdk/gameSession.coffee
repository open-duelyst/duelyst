###
why is code organized int his weird fashion? check: https://coderwall.com/p/myzvmg
###


class GameSession

  # region INSTANCE

  @instance: null

  @create: () ->
    return new _GameSession()

  @getInstance: () ->
    #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.getInstance"
    @instance ?= new _GameSession()
    return @instance

  # alias of "getInstance"
  @current: () ->
    @instance ?= new _GameSession()
    return @instance

  @reset: () ->
    if @instance?
      @instance.terminate()
      @instance = null

  # endregion INSTANCE

  # region CACHES

  @_cardsCachedAt: null # When the card caches were last built.
  @_cardCaches: null # caches of all cards

  ###*
  * Returns all card caches.
  * NOTE: getCardCaches() will lazily create all cards and all further chained methods will lazily group those cards
  * @param {moment} systemTime
  * @public
  * @example
  * # getCardCaches returns an object with getter methods
  * # each part of the cache chain also returns a similar object
  * GameSession.getCardCaches().getCards() # returns array of cards
  * GameSession.getCardCaches().getCardIds() # returns array of card ids
  * GameSession.getCardCaches().getCardsData() # returns array of {id: cardId} objects
  *
  * # the cache chain is created for each key in GameSession._cacheCardsBy
  * # where each key value is mapped to a getter method
  * # such as the getter method "getCardSet" for the key "cardSet"
  * GameSession.getCardCaches().getCardSet(cardSetId).getCards()
  * GameSession.getCardCaches().getFaction(factionId).getCardIds()
  * GameSession.getCardCaches().getRarity(rarityId).getCardsData()
  * ...etc
  *
  * # the cache chain can be traversed in any order
  * # but it is recommended that traversal be done in order from general to specific
  * # to prevent unnecessary caches from being created
  * GameSession.getCardCaches().getCardSet(cardSetId).getFaction(factionId).getCards()
  * GameSession.getCardCaches().getFaction(factionId).getCardSet(cardSetId).getCards()
  * GameSession.getCardCaches().getCardSet(cardSetId).getRarity(rarityId).getFaction(factionId).getCardIds()
  * GameSession.getCardCaches().getRarity(rarityId).getFaction(factionId).getCardSet(cardSetId).getCardIds()
  * ...etc
  ###
  @getCardCaches: (systemTime) ->
    @_buildCachesIfNeeded(systemTime)
    return @_cardCaches

  ###*
  * Map of keys to cache cards by. All keys will have own caches and then will cross cache in all possible combinations.
  * NOTE: keys must not conflict with each other or any of the utility method names!
  * @example
  *  {
  *    key: "keyName" # string name of key, where getter method is "getKeyName"
  *    getGroupKey: (card) -> return card.getCardSetId() # method that returns a string, number, or boolean as a key to group card by
  *    getGroupKeys: () -> return ["groupKey1", ..., "groupKeyN"] # method that returns an array of strings, numbers, or booleans that contains all possible group keys
  *  }
  * @see getCardCaches
  ###
  @_cacheCardsBy: [
    {
      key: "cardSet"
      getGroupKey: (card) -> return card.getCardSetId()
      getGroupKeys: () -> return _.map(_.filter(Object.keys(CardSet), (key) -> return !_.isObject(CardSet[key]) && !_.isFunction(CardSet[key])), (key) -> return CardSet[key])
    }
    {
      key: "faction"
      getGroupKey: (card) -> return card.getFactionId()
      getGroupKeys: () -> return _.map(_.filter(Object.keys(Factions), (key) -> return !_.isObject(Factions[key]) && !_.isFunction(Factions[key])), (key) -> return Factions[key])
    }
    {
      key: "rarity"
      getGroupKey: (card) -> return card.getRarityId()
      getGroupKeys: () -> return _.map(_.filter(Object.keys(Rarity), (key) -> return !_.isObject(Rarity[key]) && !_.isFunction(Rarity[key])), (key) -> return Rarity[key])
    }
    {
      key: "race"
      getGroupKey: (card) -> return card.getRaceId()
      getGroupKeys: () -> return _.map(_.filter(Object.keys(Races), (key) -> return !_.isObject(Races[key]) && !_.isFunction(Races[key])), (key) -> return Races[key])
    }
    {
      key: "isToken"
      getGroupKey: (card) -> return card.getRarityId() == Rarity.TokenUnit
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "type"
      getGroupKey: (card) -> return card.getType()
      getGroupKeys: () -> return _.map(_.filter(Object.keys(CardType), (key) -> return !_.isObject(CardType[key]) && !_.isFunction(CardType[key])), (key) -> return CardType[key])
    }
    {
      key: "isGeneral"
      getGroupKey: (card) -> return card instanceof Entity and card.getIsGeneral()
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isCollectible"
      getGroupKey: (card) -> return card.getIsCollectible()
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isUnlockable"
      getGroupKey: (card) -> return card.getIsUnlockable()
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isHiddenInCollection"
      getGroupKey: (card) -> return card.getIsHiddenInCollection()
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isPrismatic"
      getGroupKey: (card) -> return Cards.getIsPrismaticCardId(card.getId())
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isSkinned"
      getGroupKey: (card) -> return Cards.getIsSkinnedCardId(card.getId())
      getGroupKeys: () -> return [true, false]
    }
    {
      key: "isLegacy"
      getGroupKey: (card) -> return card.getIsLegacy() || CardSetFactory.cardSetForIdentifier(card.getCardSetId()).isLegacy?
      getGroupKeys: () -> return [true, false]
    }
  ]

  ###*
  * Builds caches of sdk card objects and cardIds
  * @param {moment} systemTime
  * @private
  ###
  @_buildCachesIfNeeded: (systemTime)->
    MOMENT_NOW_UTC = systemTime || moment().utc()

    # we don't have a cached array or if the month has changed since last cache
    # we need to check month because monthly content cards are invisible until month rolls over
    if !GameSession._cardsCachedAt? or MOMENT_NOW_UTC.month() != GameSession._cardsCachedAt.month()
      GameSession._cardsCachedAt = moment(MOMENT_NOW_UTC)
      Logger.module("GameSession").debug "_buildCachesIfNeeded() -> building card cache.".yellow

      # get a list of factions indexed by ID
      # so we can check if a faction is in development when filtering cards
      factionsHash = {}
      for faction in FactionFactory.getAllFactions()
        factionsHash[faction.id] = faction

      # create all cards
      gameSession = GameSession.create()
      allCards = CardFactory.getAllCards(gameSession)

      # reject cards that are:
      # - unreleased / in development
      # - hidden to users
      # - not in an enabled faction
      allCards = _.filter(allCards, (card) ->
        return card.getIsAvailable(MOMENT_NOW_UTC) and
            factionsHash[card.getFactionId()]? and
            factionsHash[card.getFactionId()].isInDevelopment != true
      )

      # create recursive caching methods
      cacheRecursive = (cacheInto, cacheByMasterKey, cardsToCache, cacheByRemaining) ->
        # cache cards
        cardsToCache ?= []

        cache = cacheInto[cacheByMasterKey] = {
          cards: cardsToCache
          getCards: () -> return @cards

          cardsById: null
          getCardById: (cardId) ->
            # lazy create map of all cards by id for easy lookup
            cardsById = {}
            for card in @cards
              cardsById[card.getId()] = card
            cache.cardsById = cardsById
            cache.getCardById = (cardId) -> return @cardsById[cardId]
            return cardsById[cardId]

          cardIds: null
          getCardIds: () ->
            # lazy map cards to ids
            cardIdsToCache = _.map(cardsToCache, (card) -> return card.getId())
            cache.cardIds = cardIdsToCache
            # replace lazy getter method
            cache.getCardIds = () -> return @cardIds
            return cardIdsToCache

          cardsData: null
          getCardsData: () ->
            # lazy map cards to data objects
            cardsDataToCache = _.map(cardsToCache, (card) -> return {id: card.getId()})
            cache.cardsData = cardsDataToCache
            # replace lazy getter method
            cache.getCardsData = () -> return @cardsData
            return cardsDataToCache
        }

        # create methods to lazy cache all sub keys when called
        for cacheByData in cacheByRemaining
          createLazySubCache(cache, cacheByData, cardsToCache, cacheByRemaining)

      createLazySubCache = (cache, cacheByData, cardsToCache, cacheByRemaining) ->
        # create getter method to lazy init sub cache
        # (this method gets replaced when sub cache is created)
        cacheByKey = cacheByData.key
        cache["get" + cacheByKey.slice(0, 1).toLocaleUpperCase() + cacheByKey.slice(1)] = (key) ->
          createSubCache(cache, cacheByData, cardsToCache, cacheByRemaining)
          return cache[cacheByKey][key]

      createSubCache = (cache, cacheByData, cardsToCache, cacheByRemaining) ->
        cacheByKey = cacheByData.key
        groupMethod = cacheByData.getGroupKey
        cacheByGroupKeys = cacheByData.getGroupKeys()
        cardsGrouped = {}

        # create groups
        for groupKey in cacheByGroupKeys
          cardsGrouped[groupKey] = []

        # group cards
        for card in cardsToCache
          cardsGrouped[groupMethod(card)].push(card)

        # create sub cache for sub key
        subCache = cache[cacheByKey] = {}

        # create getter method for sub cache card groups
        cache["get" + cacheByKey.slice(0, 1).toLocaleUpperCase() + cacheByKey.slice(1)] = (key) -> return subCache[key]

        # remove sub key from remaining
        subCacheByRemaining = []
        for subCacheByData in cacheByRemaining
          subCacheByKey = subCacheByData.key
          if subCacheByKey != cacheByKey
            subCacheByRemaining.push(subCacheByData)

        # cache each group of cards
        for groupKey in cacheByGroupKeys
          cacheRecursive(subCache, groupKey, cardsGrouped[groupKey], subCacheByRemaining)

      # create caches starting with all cards
      cacheRecursive(GameSession, "_cardCaches", allCards, GameSession._cacheCardsBy)

  # endregion CACHES

module.exports = GameSession

moment = require 'moment'
_ = require 'underscore'
Logger = require 'app/common/logger'

Logger.module('SDK').log 'Loading cards...' # Takes 10-15 seconds.
Card = require './cards/card'
CardFactory = require './cards/cardFactory'
CardSet = require 'app/sdk/cards/cardSetLookup'
CardSetFactory = require 'app/sdk/cards/cardSetFactory'
CardType = require './cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
FactionFactory = require 'app/sdk/cards/factionFactory'
Factions = require 'app/sdk/cards/factionsLookup'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Logger.module('SDK').log 'Finishing SDK initialization...'
SDKObject = require './object'
CONFIG = require 'app/common/config'
EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
UtilsJavascript = require 'app/common/utils/utils_javascript'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
GameType = require './gameType'
GameFormat = require './gameFormat'
Player = require './player'
BattleMapTemplate = require './battleMapTemplate'
Board = require './board'
Entity = require './entities/entity'
Unit = require './entities/unit'
Spell = require './spells/spell'
Artifact = require './artifacts/artifact'
GameTurn = require './gameTurn'
ActionFactory = require './actions/actionFactory'
Modifier = require './modifiers/modifier'
PlayerModifier = require './playerModifiers/playerModifier'
ModifierFactory = require './modifiers/modifierFactory'
GameStatus = require './gameStatus'
Step = require './step'
NetworkManager = require './networkManager'
ChallengeCategory = require './challenges/challengeCategory'
CosmeticsFactory = require './cosmetics/cosmeticsFactory'
ModifierCustomSpawn = require './modifiers/modifierCustomSpawn'

Action = require './actions/action'
ResignAction = require './actions/resignAction'
StartTurnAction = require './actions/startTurnAction'
EndTurnAction = require './actions/endTurnAction'
RevealHiddenCardAction = require './actions/revealHiddenCardAction'
StopBufferingEventsAction = require './actions/stopBufferingEventsAction'
RemoveAction = require './actions/removeAction'
DieAction = require './actions/dieAction'
KillAction = require './actions/killAction'
DrawCardAction = require './actions/drawCardAction'
PutCardInHandAction = require './actions/putCardInHandAction'
PutCardInDeckAction = require './actions/putCardInDeckAction'
ApplyCardToBoardAction = require './actions/applyCardToBoardAction'
GenerateSignatureCardAction = require './actions/generateSignatureCardAction'
PlayCardAction = require './actions/playCardAction'
RollbackToSnapshotAction = require './actions/rollbackToSnapshotAction'
ApplyModifierAction = require './actions/applyModifierAction'
RemoveModifierAction = require './actions/removeModifierAction'
PlayCardFromHandAction = require './actions/playCardFromHandAction'

ValidatorExecuteExplicitAction = require './validators/validatorExecuteExplicitAction'
ValidatorPlayCard = require './validators/validatorPlayCard'
ValidatorApplyCardToBoard = require './validators/validatorApplyCardToBoard'
ValidatorEntityAction = require './validators/validatorEntityAction'
ValidatorFollowup = require './validators/validatorFollowup'
ValidatorReplaceCardFromHand = require './validators/validatorReplaceCardFromHand'
ValidatorScheduledForRemoval = require './validators/validatorScheduledForRemoval'

class _GameSession extends SDKObject

  aiDifficulty: null
  aiPlayerId:null
  board: null
  cardsByIndex:null # master map of cards in this game
  createdAt:null
  currentTurn:null # the currently active turn
  battleMapTemplate: null # properties determining the battle map environment this game is payed in (map, weather, etc)
  gameId: "N/A"
  gameType: null # see GameType lookup
  gameFormat: null # see GameType lookup
  index: 0
  lastActionTimestamp:null
  modifiersByIndex:null # master map of modifiers played in this game
  players:null # master list of players in this game
  gameSetupData: null # sparse snapshot of player state after game was first setup, usually used for replays
  status:null # status of game (i.e. whether new, active, or over)
  swapPlayersOnNewTurn:true # normally true, but can be set false by certain effects (take another turn after this one)
  turns:null # master list of turns in this game, where each turn contains a list of steps played during its time
  updatedAt:null

  constructor: () ->
    super(@)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @gameSetupData = {players: []}
    @status = GameStatus.new
    @cardsByIndex = {}
    @modifiersByIndex = {}

    @createdAt = Date.now()
    @updatedAt = Date.now()

    @turns = []
    @currentTurn = new GameTurn(@)

    @players = []
    player1 = new Player(@, "1", "player1")
    player1.setStartingMana(CONFIG.STARTING_MANA)
    @players.push(player1)
    player2 = new Player(@, "2", "player2")
    player2.setStartingMana(CONFIG.STARTING_MANA + 1)
    @players.push(player2)
    @getPlayer1().setIsCurrentPlayer(true)

    @battleMapTemplate = new BattleMapTemplate(@)

    @board = new Board(this, CONFIG.BOARDCOL, CONFIG.BOARDROW )

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    # caches
    p.cachedGeneralsByPlayerId = {}
    p.cachedEventReceivingCards = null

    # events
    p.eventBus = EventBus.create()
    p.eventBuffer = []
    p.eventReceivingCardsOnBoard = []

    # action queue
    p.action = null # currently executing action
    p.actionExecutionEventType = null
    p.actionExecutionEventTypeStack = []
    p.actionsToResolve = [] # actions that have been executed and need resolution during step resolve phase
    p.actionsByIndex = {} # map of actions by index, reconstructed from all steps in all turns
    p.actionQueue = null
    p.blockActionExecution = false
    p.cardStack = [] # stack of cards actively applying to board during action execution loop (top is most recent)
    p.depthFirstActions = [] # list of depth first actions that have been executed for the currently executing action
    p.gameOverRequested = false
    p.hasDrawnCardsForTurn = false
    p.hasActivatedSignatureCardForTurn = false
    p.lastStep = null
    p.modifierStack = [] # stack of modifiers that are triggering during action execution loop (top is most recent)
    p.nonDepthFirstAction = null # currently executing non depth first action
    p.parentAction = null # current parent action
    p.resolveAction = null # current resolve action
    p.updatedElapsedEndTurn = false # whether end turn duration elapsed has updated
    p.updatedElapsedStartTurn = false # whether start turn duration elapsed has updated
    p.startTurnAction = null # current start turn action if turns are changing
    p.step = null # currently executing step
    p.stepsByIndex = {} # map of steps by index
    p.stepQueue = [] # current queue of steps to be executed
    p.submittedExplicitAction = null # action submitted for execution by an authoritative source

    # followups
    p.followupActive = false # whether followups are being played (valid for server, player, and opponent)
    p.isBufferingEvents = false # whether events should be buffered (valid for server, player, and opponent)
    p.rollbackSnapshotData = null # current rollback snapshot if followups are being played (only valid for server and player)
    p.rollbackSnapshotDataDiscardRequested = false
    p.rollbackToSnapshotRequested = false

    # misc
    p.challenge = null
    p.isDeveloperMode = false # whether game is a developer game
    p.isRunningAsAuthoritative = false # whether game is authoritative
    p.isSpectateMode = false # whether game is a spectate game
    p.isReplay = false # whether a game is a replay
    p.isSignatureCardAlwaysReady = false # override signature card to be ready every turn instead of based on timer
    p.turnTimeRemaining = CONFIG.TURN_DURATION + CONFIG.TURN_DURATION_LATENCY_BUFFER # remaining turn time
    p.userId = "" # id of user this game is the client for

    # master list of validators (anti-cheat) for this game
    p.validators = []
    p.validators.push(new ValidatorScheduledForRemoval(@))
    p.validators.push(new ValidatorExecuteExplicitAction(@))
    p.validators.push(new ValidatorPlayCard(@))
    p.validators.push(new ValidatorReplaceCardFromHand(@))
    p.validators.push(new ValidatorApplyCardToBoard(@))
    p.validators.push(new ValidatorEntityAction(@))
    p.validatorFollowup = new ValidatorFollowup(@)
    p.validators.push(p.validatorFollowup)

    return p

  ###*
   * Terminates and cleans up this game session instance. No more events or actions are allowed.
   ###
  terminate: () ->
    Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.terminate"
    @pushEvent({type: EVENTS.terminate, gameSession: @}, {blockActionExecution: true})
    @_private.eventBuffer = []
    @getEventBus()?.off()

  # region getters / setters

  generateIndex: () ->
    return @index = @index + 1 + (Math.random() * 100.0) | 0

  getGameId: () ->
    return @gameId

  getGameSetupData: () ->
    return @gameSetupData

  getPlayer1SetupData: () ->
    return @gameSetupData.players[0]

  getPlayer2SetupData: () ->
    return @gameSetupData.players[1]

  getMyPlayerSetupData: () ->
    if @getPlayer1Id() == @getMyPlayerId()
      return @getPlayer1SetupData()
    else
      return @getPlayer2SetupData()

  getOpponentPlayerSetupData: () ->
    if @getPlayer1Id() == @getOpponentPlayerId()
      return @getPlayer1SetupData()
    else
      return @getPlayer2SetupData()

  getPlayerSetupDataForPlayerId: (playerId) ->
    if @getPlayer1Id() == playerId
      return @getPlayer1SetupData()
    else
      return @getPlayer2SetupData()

  setValidators: (val) ->
    @_private.validators = val

  getValidators: () ->
    return @_private.validators

  getValidatorFollowup: () ->
    return @_private.validatorFollowup

  getBoard: () ->
    return @board

  getBattleMapTemplate: () ->
    return @battleMapTemplate

  setBattleMapTemplate: (battleMapTemplate) ->
    @battleMapTemplate = battleMapTemplate

  ###*
  * Get how many MS there are remaining in the turn. For now, this is a value that is set on the game session by an outside controller based on server or local client timer. This value can be used to bind to periodically bind UI or to check against.
  * @return {int} Turn milliseconds remaining.
  ###
  getTurnTimeRemaining: () ->
    return @_private.turnTimeRemaining

  ###*
  * Set remaining turn time info.
  * @param {int}    Turn milliseconds remaining.
  ###
  setTurnTimeRemaining: (value) ->
    @_private.turnTimeRemaining = value
    @pushEvent({type: EVENTS.turn_time, time:value, gameSession: @})

  # endregion getters

  # region event streams

  ###*
   * Returns the event bus where all events are piped through.
    ###
  getEventBus: () ->
    return @_private.eventBus

  ###*
   * Push an event directly, ignoring followup buffering.
   * @param {Object} event event object
   * @param {Object} [options=null] optional flags and properties to control how the event is pushed to the stream
   * @example
   * event = {type: "event_type", eventProperty: "property_value", ...}
   * GameSession.getInstance().pushEvent(event, {
   *  blockActionExecution: true, # whether to automatically block any actions created in response to this event
   *  action: null # force the parent action of this event to a specific action
   *  resolveAction: null # force the resolve parent action of this event to a specific action (useful for resolve events)
   * })
   ###
  pushEvent: (event, options) ->
    eventType = event.type
    @pushEventTypeToStack(eventType)

    if !options?
      # push, no options
      @_private.blockActionExecution = false

      # push event to session, players, cards, modifiers
      @_pushEventToSession(event, options)

      # push event to bus
      @getEventBus().trigger(eventType, event)
    else
      if options.blockActionExecution
        @_private.blockActionExecution = true

      # forced actions
      action = options.action
      resolveAction = options.resolveAction
      if action?
        lastAction = @getExecutingAction()
        @setExecutingAction(action)
      if resolveAction?
        lastResolveAction = @getExecutingResolveAction()
        @setExecutingResolveAction(resolveAction)

      # push event to session, players, cards, modifiers
      @_pushEventToSession(event, options)

      # push event to bus
      @getEventBus().trigger(eventType, event)

      # reset forced actions
      if action?
        @setExecutingAction(lastAction)
      if resolveAction?
        @setExecutingResolveAction(lastResolveAction)

    # execute any authoritative sub actions for the event's action that occurred during this event
    parentAction = @getExecutingParentAction()
    if event.executeAuthoritativeSubActions and parentAction?
      parentAction.executeNextOfEventTypeFromAuthoritativeSubActionQueue(eventType)

    # reset
    @_private.blockActionExecution = false
    @popEventTypeFromStack()


  ###*
   * Pushes an event to the session. Do not call this method directly, use pushEvent instead. Order of events is:
   * - validators
   * - challenge
   * - players
   * - player cards
   * - player card's modifiers
   * - game session cards
   ###
  _pushEventToSession: (event, options) ->
    isBufferable = event.isBufferable

    # push event to validators
    for validator in @getValidators()
      validator.onEvent(event)

    # push event to challenge
    if @_private.challenge?
      @_private.challenge.onEvent(event)

    # push event to players and their cards
    @getCurrentPlayer().onEvent(event)
    @getNonCurrentPlayer().onEvent(event)

    # push event to game session cards
    for card in @getEventReceivingCards()
      card.onEvent(event)
      if @getIsBufferingEvents() and isBufferable then break

    # if buffering began while processing bufferable event
    # return event to event buffer
    if isBufferable and @getIsBufferingEvents()
      @_private.eventBuffer.push({
        event: event,
        options: options
      })

  pushEventTypeToStack: (eventType) ->
    @getActionExecutionEventTypeStack().push(eventType)
    @setActionExecutionEventType(eventType)

  popEventTypeFromStack: () ->
    eventTypeStack = @getActionExecutionEventTypeStack()
    eventTypeStack.pop()
    @setActionExecutionEventType(eventTypeStack[eventTypeStack.length - 1])

  getCurrentEventType: () ->
    eventTypeStack = @getActionExecutionEventTypeStack()
    return eventTypeStack[eventTypeStack.length - 1]

  ###*
   * Buffer an event as needed, otherwise push directly.
   * @param {Object} event event object
   * @param {Object} [options=null] optional event options
   * @see pushEvent
   ###
  pushBufferableEvent: (event, options) ->
    event.isBufferable = true
    if @getIsBufferingEvents()
      @_private.eventBuffer.push({
        event: event,
        options: options
      })
    else
      @pushEvent(event, options)

  # endregion event streams

  # region event buffering

  getIsBufferingEvents: () ->
    return @_private.isBufferingEvents

  ###*
   * SDK (package) level method that may be called to start buffering action events.
   ###
  p_startBufferingEvents: () ->
    Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_startBufferingEvents"
    @_private.isBufferingEvents = true

  ###*
   * SDK (package) level method that may be called to end buffering, end followup, discard rollback snapshot, and flush the buffered events.
   ###
  p_stopBufferingEvents: () ->
    Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_stopBufferingEvents"
    # retain buffer in case we were buffering before discard
    bufferedEvents = @_private.eventBuffer
    @_discardRollbackSnapshot()

    if !@isOver()
      # validate game over request
      if @_private.gameOverRequested
        @_validateGameOverRequest()

      # flush buffered events
      if bufferedEvents and bufferedEvents.length > 0
        Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._flushBufferedEvents"
        # push all previously buffered events to main event stream
        for eventData, i in bufferedEvents
          #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._flushBufferedEvents -> type #{eventData.event?.type} action? #{eventData.event?.action?.getLogName()}"
          @pushEvent(eventData.event, eventData.options, true)

          # if events started buffering again during flush
          # stop flush and move remaining buffered events back into event buffer
          if @getIsBufferingEvents() and bufferedEvents.length > i + 1
            #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._flushBufferedEvents -> buffering started mid-flush, moving #{bufferedEvents.length - (i + 1)} events back into buffer"
            @_private.eventBuffer = @_private.eventBuffer.concat(bufferedEvents.slice(i + 1))
            break

  ###*
   * Helper method to generate a stop buffering events action.
   ###
  actionStopBufferingEvents: () ->
    endBufferingAction = @createActionForType(StopBufferingEventsAction.type)
    endBufferingAction.setOwnerId(@getCurrentPlayerId())
    return endBufferingAction

  # endregion event buffering

  # region followups

  getIsFollowupActive: () ->
    return @_private.followupActive

  getIsMyFollowupActive: () ->
    return @isMyTurn() and @getIsFollowupActive()

  getIsMyFollowupActiveAndCancellable: () ->
    # allow active followups to be cancelled when not in a tutorial
    return @getIsMyFollowupActive() and !@isTutorial()

  _startFollowup: () ->
    if !@_private.followupActive
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._startFollowup"
      @_private.followupActive = true
      @p_startBufferingEvents()

      # rollback snapshots are only allowed for the player playing the followup or the server
      if @isMyTurn() || @getIsRunningAsAuthoritative()
        @_private.rollbackSnapshotData = @generateGameSessionSnapshot()
        @pushEvent({type: EVENTS.rollback_to_snapshot_recorded, gameSession: @}, {blockActionExecution: true})

  # endregion followups

  # region snapshots

  ###*
   * Helper method to generate a rollback to snapshot action.
   ###
  actionRollbackSnapshot: () ->
    action = @createActionForType(RollbackToSnapshotAction.type)
    action.setOwnerId(@getCurrentPlayerId())
    return action

  ###*
   * SDK (package) level method that may be called to force all sdk objects with cached state to immediately sync to the latest game state.
   * NOTE: only use this when setting up a game in a non-standard way. Normally all sdk objects update cached state in response to events.
   ###
  syncState: () ->
    #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.syncState"
    modifierIndices = Object.keys(@modifiersByIndex)
    for modifierIndex in modifierIndices
      modifier = @modifiersByIndex[modifierIndex]
      modifier.syncState()

    cardIndices = Object.keys(@cardsByIndex)
    for cardIndex in cardIndices
      card = @cardsByIndex[cardIndex]
      card.syncState()

    for player in @players
      player.syncState()

  ###*
   * SDK (package) level method that may be called to request a rollback.
   * NOTE: only use this during the action execution loop.
   ###
  p_requestRollbackToSnapshot: () ->
    #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_requestRollbackToSnapshot"
    @_private.rollbackToSnapshotRequested = true
    @pushEvent({type: EVENTS.rollback_to_snapshot_requested, gameSession: @}, {blockActionExecution: true})

  ###*
   * SDK (package) level method that may be called to request a discard of rollback data.
   * NOTE: only use this during the action execution loop.
   ###
  p_requestRollbackSnapshotDiscard: () ->
    #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_requestRollbackSnapshotDiscard"
    @_private.rollbackSnapshotDataDiscardRequested = true

  generateGameSessionSnapshot: () ->
    return @serializeToJSON(this)

  getRollbackSnapshotData: () ->
    return @_private.rollbackSnapshotData

  _rollbackToSnapshot: (snapshotData) ->
    if !snapshotData
      snapshotData = @_private.rollbackSnapshotData
      @_discardRollbackSnapshot()

    # rollback snapshots are only allowed for the player playing the followup or the server
    if (@isMyTurn() || @getIsRunningAsAuthoritative()) and snapshotData?
      Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._rollbackToSnapshot"

      # rollback by deserializing the snapshot data
      @pushEvent({type: EVENTS.before_rollback_to_snapshot, gameSession: @}, {blockActionExecution: true})
      @deserializeSessionFromFirebase(JSON.parse(snapshotData))
      @pushEvent({type: EVENTS.rollback_to_snapshot, gameSession: @}, {blockActionExecution: true})


  _discardRollbackSnapshot: () ->
    @_private.followupActive = false
    @_private.isBufferingEvents = false
    @_private.rollbackToSnapshotRequested = false
    @_private.rollbackSnapshotDataDiscardRequested = false
    @_private.rollbackSnapshotData = null
    @_private.eventBuffer = []

  # endregion snapshots

  # region status

  setIsRunningAsAuthoritative: (isRunningAsAuthoritative) ->
    @_private.isRunningAsAuthoritative = isRunningAsAuthoritative

  getIsRunningAsAuthoritative: () ->
    return @_private.isRunningAsAuthoritative

  getIsRunningOnClient: () ->
    return !@getIsRunningAsAuthoritative() or GameType.isLocalGameType(@getGameType())

  getStatus: () ->
    @status

  setStatus: (s) ->
    Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.setStatus - from #{@status} to #{s}"
    if @status != s
      prevStatus = @status
      @status = s
      @pushEvent({type: EVENTS.status, status:s, from:prevStatus, to:s, gameSession: @}, {blockActionExecution: true})

  isNew: () ->
    return @status == GameStatus.new

  isActive: () ->
    return @status == GameStatus.active

  isOver: () ->
    return @status == GameStatus.over

  setGameType: (val) ->
    @gameType = val

  getGameType: () ->
    return @gameType

  setGameFormat: (val) ->
    @gameFormat = val

  getGameFormat: () ->
    return @gameFormat

  isRanked: () ->
    return @gameType == GameType.Ranked

  isRift: () ->
    return @gameType == GameType.Rift

  isCasual: () ->
    return @gameType == GameType.Casual

  isGauntlet: () ->
    return @gameType == GameType.Gauntlet

  isFriendly: () ->
    return @gameType == GameType.Friendly

  isSandbox: () ->
    return @gameType == GameType.Sandbox

  isChallenge: () ->
    return @gameType == GameType.Challenge

  isDailyChallenge: () ->
    return @isChallenge() and @getChallenge()?.isDaily

  isSinglePlayer: () ->
    return @gameType == GameType.SinglePlayer

  isBossBattle: () ->
    return @gameType == GameType.BossBattle

  isTutorial: () ->
    return @isChallenge() and @getChallenge()?.categoryType == ChallengeCategory.tutorial.type

  getAreDecksRandomized: () ->
    return !@isChallenge() and !@getIsDeveloperMode()

  getChallenge:()->
    return @_private.challenge

  setChallenge:(val)->
    @_private.challenge = val

  setAiDifficulty: (val) ->
    @aiDifficulty = val

  getAiDifficulty: () ->
    return @aiDifficulty

  ###*
   * SDK (package) level method that may be called to request a check for whether game is over.
   * NOTE: only use this during the action execution loop.
   ###
  p_requestGameOver: () ->
    #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_requestGameOver"
    @_private.gameOverRequested = true

  _validateGameOverRequest: () ->
    # don't bother validating unless game is not yet over and events are not being buffered
    if !@isOver() and !@getIsBufferingEvents()
      @_private.gameOverRequested = false

      # emit event that game over state should be validated
      # this gives modifiers a chance to swap general or otherwise prevent general death
      if !(@getExecutingAction().getRootAction() instanceof ResignAction) then @pushEvent({type: EVENTS.validate_game_over, action: @getExecutingAction(), executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), gameSession: @}, {resolveAction: @getExecutingAction()})

      # check for dead generals
      deadGenerals = []
      for player in @players
        general = @getGeneralForPlayerId(player.getPlayerId())

        # find last general if player currently has no general
        if !general?
          maxRemovedByActionIndex = -1
          cardIndices = Object.keys(@cardsByIndex)
          for index in cardIndices
            card = @cardsByIndex[index]
            if card instanceof Entity and card.isOwnedBy(player) and card.getWasGeneral()
              removedByActionIndex = card.getRemovedFromBoardByActionIndex()
              if removedByActionIndex > maxRemovedByActionIndex
                general = card
                break

        if general? and general.getIsRemoved()
          deadGenerals.push(general)

      # at least one dead general
      if deadGenerals.length > 0
        # when number of generals is greater than 1, we've got a draw
        # otherwise, find player that is winner
        if deadGenerals.length == 1
          deadGeneral = deadGenerals[0]
          for player in @players
            if deadGeneral.getOwnerId() != player.getPlayerId()
              winningPlayerId = player.getPlayerId()

        # stop buffering events
        if @getIsBufferingEvents()
          @executeAction(@actionStopBufferingEvents())

        # set winning player if any
        if winningPlayerId?
          @getPlayerById(winningPlayerId).setIsWinner(true)

        # set game as over
        @setStatus(GameStatus.over)

        # emit game over
        @pushEvent({type: EVENTS.game_over, winner: @getWinner(), gameSession: @}, {blockActionExecution: true})
        Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._validateGameOverRequest -> GAME OVER.".red

  # endregion status

  # region players

  getPlayerId: () ->
    return "GameSession"

  setUserId: (userId) ->
    @_private.userId = userId

  getUserId: () ->
    return @_private.userId

  isMyTurn: () ->
    return @getMyPlayerId() == @getCurrentPlayer().getPlayerId()

  isMyTurnEnding: () ->
    return @getMyPlayerId() == @getCurrentPlayer().getPlayerId() and @getCurrentTurn().getEnded()

  ###*
   * Returns all players.
   * @returns {Array}
   ###
  getPlayers: () ->
    return @players

  ###*
   * Returns the player for a player id.
   * @param {String} playerId
   ###
  getPlayerById: (playerId) ->
    if playerId?
      for player in @players
        if (player.getPlayerId() == playerId)
          return player

      # a player should ALWAYS be found when a player id is defined
      Logger.module("SDK").error("[G:#{@.gameId}].getPlayerById -> No player found with playerId: ", playerId)
    else if @getUserId()?
      # a player id should always be passed in if we have at least the user id defined
      Logger.module("SDK").error("[G:#{@.gameId}].getPlayerById -> Cannot get player by NULL playerId!")

  getMyPlayerId: () ->
    return @getUserId()

  getMyPlayer: () ->
    return @getPlayerById(@getMyPlayerId())

  setAiPlayerId: (val) ->
    @aiPlayerId = val

  getAiPlayerId: ()->
    return @aiPlayerId || CONFIG.AI_PLAYER_ID

  getLocalPlayer: @::getMyPlayer

  getOpponentPlayerId: () ->
    opponentPlayer = @getOpponentPlayer()
    if opponentPlayer?
      return opponentPlayer.getPlayerId()

  getOpponentPlayer: () ->
    return @getOpponentPlayerOfPlayerId(@getMyPlayerId())

  getOpponentPlayerIdOfPlayerId: (playerId) ->
    if playerId == @getPlayer1Id()
      return @getPlayer2Id()
    else
      return @getPlayer1Id()

  ###*
   * Returns the opponent player for a player id.
   * @param {String} playerId
   ###
  getOpponentPlayerOfPlayerId: (playerId) ->
    if playerId?
      for player in @players
        if (player.getPlayerId() != playerId)
          return player

      # a player should ALWAYS be found when a player id is defined
      Logger.module("SDK").error("[G:#{@.gameId}].getPlayerById -> No opponent player found to playerId: ", playerId)
    else if @getUserId()?
      # a player id should always be passed in if we have at least the user id defined
      Logger.module("SDK").error("[G:#{@.gameId}].getPlayerById -> Cannot get opponent player of NULL playerId!")

  getCurrentPlayer: () ->
    for player in @players
      if player.getIsCurrentPlayer()
        return player

  getCurrentPlayerId: () ->
    return @getCurrentPlayer().getPlayerId()

  getNonCurrentPlayer: () ->
    for player in @players
      if !player.getIsCurrentPlayer()
        return player

  getNonCurrentPlayerId: () ->
    return @getNonCurrentPlayer().getPlayerId()

  getPlayer1: () ->
    return @players[0]

  getPlayer1Id: () ->
    return @getPlayer1().getPlayerId()

  getPlayer2: () ->
    return @players[1]

  getPlayer2Id: () ->
    return @getPlayer2().getPlayerId()

  ###*
   * Returns the general unit for a player id.
   * @param {String} playerId
   ###
  getGeneralForPlayerId: (playerId) ->
    if playerId?
      general = @_private.cachedGeneralsByPlayerId[playerId]

      if !general?
        cardIndices = Object.keys(@cardsByIndex)
        for cardIndex in cardIndices
          card = @cardsByIndex[cardIndex]
          if card instanceof Unit and card.getIsGeneral() and card.getOwnerId() == playerId
            @_private.cachedGeneralsByPlayerId[playerId] = card
            general = card

      return general
    else if @getUserId()?
      # a player id should always be passed in if we have at least the user id defined
      Logger.module("SDK").error("[G:#{@.gameId}].getGeneralForPlayerId -> Cannot get general of NULL playerId!")

  getGeneralForPlayer: (player) ->
    return @getGeneralForPlayerId(player?.getPlayerId())

  getGeneralForOpponentOfPlayerId: (playerId) ->
    return @getGeneralForPlayerId(@getOpponentPlayerIdOfPlayerId(playerId))

  getGeneralForPlayer1: () ->
    return @getGeneralForPlayerId(@getPlayer1Id())

  getGeneralForPlayer2: () ->
    return @getGeneralForPlayerId(@getPlayer2Id())

  getGeneralForMyPlayer: () ->
    return @getGeneralForPlayerId(@getMyPlayerId())

  getGeneralForOpponentPlayer: () ->
    return @getGeneralForPlayerId(@getOpponentPlayerId())

  ###*
   * Flushes the cached found generals by player id. Use this when a general changes during the game.
   ###
  flushCachedGeneralsByPlayerId: () ->
    @_private.cachedGeneralsByPlayerId = {}

  ###*
   * Flushes the cached found general for a player id. Use this when a general changes during the game.
   ###
  flushCachedGeneralForPlayerId: (playerId) ->
    if playerId?
      delete @_private.cachedGeneralsByPlayerId[playerId]
    else
      @flushCachedGeneralsByPlayerId()

  flushCachedGeneralForPlayer: (player) ->
    @flushCachedGeneralForPlayerId(player?.getPlayerId())

  setEntityAsNewGeneral: (entity) ->
    if entity instanceof Entity
      owner = entity.getOwner()

      # disable previous general
      currentGeneral = @getGeneralForPlayer(owner)
      if currentGeneral?
        currentGeneral.setIsGeneral(false)

      # enable new general
      entity.setIsGeneral(true)

      # move entity to front of event receiving cards for owner
      owner.moveEventReceivingCardToFront(entity)

      # flush caches
      @flushCachedGeneralForPlayer(owner)
      owner.flushCachedEventReceivingCards()

  setEntityAsNotGeneral: (entity) ->
    if entity instanceof Entity
      owner = entity.getOwner()

      # remove all player modifiers from old general
      for modifier in entity.getModifiers() by -1
        if modifier instanceof PlayerModifier
          @getGameSession().removeModifier(modifier)

      # disable entity as general
      entity.setIsGeneral(false)

      # move entity to end of event receiving cards for owner
      owner.removeEventReceivingCardOnBoard(entity)
      owner.addEventReceivingCardOnBoard(entity)

      # flush caches
      @flushCachedGeneralForPlayer(owner)
      owner.flushCachedEventReceivingCards()

  ###*
   * Returns the event receiving cards for the game session. Does not include player's event receiving cards.
   ###
  getEventReceivingCards: () ->
    # this has to be its own array so that it cannot be modified mid event loop
    @_private.cachedEventReceivingCards ?= [].concat(
      @getEventReceivingCardsOnBoard()
    )
    return @_private.cachedEventReceivingCards

  ###*
   * Flushes all cached cards.
   ###
  flushAllCachedCards: () ->
    @flushCachedEventReceivingCards()

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

  getWinner:() ->
    for player in @players
      if player.getIsWinner()
        return player

  getWinnerId:() ->
    return @getWinner()?.getPlayerId()

  getLoser:() ->
    for player in @players
      if !player.getIsWinner()
        return player

  getLoserId:() ->
    return @getLoser()?.getPlayerId()

  willSwapCurrentPlayerNextTurn:() ->
    return @swapPlayersOnNewTurn

  skipSwapCurrentPlayerNextTurn:() ->
    @swapPlayersOnNewTurn = false

  getIsDeveloperMode:()->
    return @_private.isDeveloperMode

  setIsDeveloperMode:(val)->
    @_private.isDeveloperMode = val || false

  setIsSpectateMode:(val)->
    @_private.isSpectateMode = val

  getIsSpectateMode:(val)->
    return @_private.isSpectateMode

  setIsReplay:(val)->
    @_private.isReplay = val

  getIsReplay:(val)->
    return @_private.isReplay

  setIsSignatureCardAlwaysReady:(val)->
    @_private.isSignatureCardAlwaysReady = val

  getIsSignatureCardAlwaysReady:(val)->
    return @_private.isSignatureCardAlwaysReady

  getIsSignatureCardAlwaysReadyForPlayer:(player)->
    return player.getIsSignatureCardAlwaysReady()

  # endregion players

  # region turns

  ###*
   * Returns the master array of turns. Do not modify this array.
   * @returns {Array}
   ###
  getTurns:() ->
    return @turns

  getCurrentTurn: () ->
    return @currentTurn

  ###*
   * Helper method to generate an end turn action.
   ###
  actionEndTurn: () ->
    endTurnAction = @createActionForType(EndTurnAction.type)
    endTurnAction.setOwnerId(@getCurrentPlayerId())
    return endTurnAction

  ###*
   * SDK (package) level method that may be called to end the current turn.
   * NOTE: only use this during the action execution loop.
   ###
  p_endTurn: () ->
    if @isActive() and !@getCurrentTurn().getEnded()
      Logger.module("SDK").debug("[G:#{@.gameId}]", "GS.p_endTurn -> turn count: #{@getNumberOfTurns()}")
      currentPlayer = @getCurrentPlayer()

      # set current turn as ended
      @currentTurn.setEnded(true)

      # make sure ended turn is tagged with player id
      @currentTurn.setPlayerId(currentPlayer.getPlayerId())

      # add ended turn to turn stack
      @turns.push(@currentTurn)

      @pushEvent({type: EVENTS.end_turn, action: @getExecutingAction(), executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), turn: @currentTurn, gameSession: @})

  ###*
   * SDK (package) level method that may be called to start a new turn.
   * NOTE: only use this during the action execution loop.
   ###
  p_startTurn: () ->
    if @isActive()
      Logger.module("SDK").debug("[G:#{@.gameId}]", "GS._startNextTurn")

      # usually active player will swap on new turn
      if @swapPlayersOnNewTurn
        # update players
        for player in @players
          # set current player
          if player.getIsCurrentPlayer()
            player.setIsCurrentPlayer(false)
          else
            player.setIsCurrentPlayer(true)
      else
        # but some spells can suppress player swap on new turn (take another turn)
        # if we didn't swap players this turn, make sure we will swap again next end turn
        @swapPlayersOnNewTurn = true

      # make sure new turn is tagged with player id
      @currentTurn.setPlayerId(@getCurrentPlayer().getPlayerId())

      # update entities
      for entity in @board.getEntities(allowUntargetable=true)
        entity.refreshExhaustion()

      for player in @players
        # retain last mana
        player.lastMaximumMana = player.getMaximumMana()
        player.lastRemainingMana = player.getRemainingMana()

        # update mana for players
        if player.getIsCurrentPlayer()
          # player 2 starts out with one more mana than player 1, so don't increment on first turn change
          # otherwise, give player +1 max mana (up to 9) at each new turn start when they are current player
          if player.maximumMana < CONFIG.MAX_MANA and @getNumberOfTurns() > 1
            player.maximumMana++
          player.remainingMana = player.maximumMana

        else
          player.remainingMana = Math.min(player.lastRemainingMana, player.maximumMana)

      @pushEvent({type: EVENTS.start_turn, action: @getExecutingAction(), executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), turn: @currentTurn, gameSession: @})

  getNumberOfTurns: () ->
    return @turns.length

  _getNumberOfTurnsUntilPlayerActivatesSignatureCard: (player, fromTurnNumber) ->
    if @getIsSignatureCardAlwaysReady()
      return 0
    else if @getIsSignatureCardAlwaysReadyForPlayer(player)
      return 0
    else
      fromTurnNumber ?= @getNumberOfTurns()
      if fromTurnNumber >= 12
        if player == @getCurrentPlayer() then return 0 else return 1
      else if player == @getPlayer2()
        # player 2 gets signature cards on game turn 5 and 9 or player turn 3 and 5
        if fromTurnNumber <= 5 then return 5 - fromTurnNumber
        if fromTurnNumber <= 9 then return 9 - fromTurnNumber
        return 13 - fromTurnNumber
      else
        # player 1 gets signature cards on game turn 4 and 8 or player turn 3 and 5
        if fromTurnNumber <= 4 then return 4 - fromTurnNumber
        if fromTurnNumber <= 8 then return 8 - fromTurnNumber
        return 12 - fromTurnNumber

  getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard: (player, ignoreHasSignatureCard=false, fromTurnNumber=@getNumberOfTurns()) ->
    hasSignatureCard = !ignoreHasSignatureCard and player.getIsSignatureCardActive()
    if hasSignatureCard
      return 0
    else
      if fromTurnNumber >= 12
        if player == @getCurrentPlayer() then numPlayerTurns = 0 else numPlayerTurns = 1
      else if player == @getPlayer2()
        numPlayerTurns = Math.ceil((4 - (Math.max(0, fromTurnNumber - 1) % 4)) * 0.5)
      else
        numPlayerTurns = Math.ceil((4 - (fromTurnNumber % 4)) * 0.5)

      if numPlayerTurns == 0 and player == @getCurrentPlayer() and !hasSignatureCard
        if fromTurnNumber >= 12 then return 1 else return 2
      else
        return numPlayerTurns

  getProgressUntilPlayerActivatesSignatureCard: (player, fromTurnNumber) ->
    hasSignatureCard = player.getIsSignatureCardActive()
    if hasSignatureCard
      return 1.0
    else
      fromTurnNumber ?= @getNumberOfTurns()
      if player == @getPlayer2()
        if fromTurnNumber >= 13
          if player == @getCurrentPlayer() and hasSignatureCard then return 1 else return 0
        else
          return 1.0 - Math.ceil((4 - (Math.max(0, fromTurnNumber - 1) % 4)) * 0.5) / 2.0
      else
        if fromTurnNumber >= 12
          if player == @getCurrentPlayer() and hasSignatureCard then return 1 else return 0
        else
          return 1.0 - Math.ceil((4 - (fromTurnNumber % 4)) * 0.5) / 2.0

  # endregion turns

  # region steps and actions

  ###*
   * Submit an explicit action for execution by an authoritative source such as the server.
   * NOTE: this should only be called on a NON authoritative source.
   * @param {Action} action
   * @returns {Boolean} whether action is valid and was submitted
   ###
  submitExplicitAction: (action) ->
    # attempt to submit action and return true if submitted, otherwise false
    # ignore attempts to submit actions if we're spectating
    if !@getIsSpectateMode() and !@_private.submittedExplicitAction? and action? and !action.getIsImplicit() and action.isFirstTime()
      # validate action before submitting
      @validateAction(action)
      if action.getIsValid()
        if @getIsRunningAsAuthoritative()
          # when in authoritative mode, just go ahead and execute the action
          @executeAction(action)
        else
          # store this action as the current explicit action
          @_private.submittedExplicitAction = action

          # create an unsigned step for the action
          step = new Step(@, action.getOwnerId())
          step.setAction(action)

          # send the step over the network
          NetworkManager.getInstance().broadcastGameEvent({type:EVENTS.step, step: step})

        return true

    return false

  ###*
   * Returns whether game session is waiting for a submitted explicit action to be returned from an authoritative source such as the server.
   * @returns {Boolean} whether waiting for a submitted action
   ###
  getIsWaitingForSubmittedExplicitAction: () ->
    return @_private.submittedExplicitAction?

  ###*
   * Execute a step provided by an authoritative source such as the server to advance and sync this game session.
   * NOTE: this should only be called on a NON authoritative source.
   * @param {Step} step previously executed step
   ###
  executeAuthoritativeStep: (step) ->
    # don't allow non-steps
    if !(step instanceof Step)
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAuthoritativeStep -> cannot execute non-step"
      return

    # don't allow non-actions
    action = step.getAction()
    if !(action instanceof Action)
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAuthoritativeStep -> cannot execute non-action"
      return

    # don't allow any steps if the game is over
    if @status == GameStatus.over
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAuthoritativeStep -> cannot execute steps when game is over"
      return

    # reset submitted explicit action as soon as we've received a step
    @_private.submittedExplicitAction = null

    # non-authoritative source must start followup or rollback before starting step
    # because starting a step writes to the current turn and modifies the game session
    @_updateStateAfterActionValidated(action)

    # queue up authoritative step
    @_queueStep(step)

    # execute first action to execute step
    @executeAction(action)

  ###*
   * Execute an action to advance this game session.
   * NOTE: this should only be called on an authoritative source.
   * @param {Action} action
   ###
  executeAction: (action) ->
    ### ERROR SIMULATOR below
    if @getIsRunningAsAuthoritative()
      null.tryMethod()
    ###

    # don't allow non-actions
    if !(action instanceof Action)
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAction -> cannot execute null action"
      return

    # don't allow any actions if the game is over
    if @status == GameStatus.over
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAction -> cannot execute actions when game is over"
      return

    # don't allow any actions unless event allows new actions
    if @_private.blockActionExecution
      #Logger.module("SDK").debug "[G:#{@gameId}]", "GameSession.executeAction -> cannot execute #{action.getType()} because #{@getActionExecutionEventType()} event does not allow new actions"
      return

    if @getIsRunningAsAuthoritative()
      # set parent action of action before validation as some validators test implicit state
      action.setParentAction(@getExecutingParentAction())
    else if action.isFirstTime()
      # we don't want to execute any actions created by non-authoritative sources such as the client
      # when an action is sent from an authoritative source such as the server it will be signed (!isFirstTime)
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAction -> cannot execute non-authoritative actions"
      return

    if action.getType() == RollbackToSnapshotAction.type and !(@getIsRunningAsAuthoritative() or @isMyTurn())
      # we can safely ignore steps with a RollbackToSnapshotAction if we're not running on the server and it's not our turn
      # otherwise we can get in a situation (in net games) where there is no recorded snapshot and this step gets added to the queue and our total step index is lower than the other person's IF they cancel their followup
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.executeAction -> ignoring RollbackToSnapshotAction that is not intended for my player"
      return

    # validate the action before modifying any game state
    @validateAction(action)

    # don't allow invalid actions
    if !action.getIsValid()
      return

    if @getIsRunningAsAuthoritative()
      # authoritative source must start followup or rollback as soon as an action is validated for execution
      # because this will always occur on authoritative source before game state is modified
      @_updateStateAfterActionValidated(action)

    # send an event that an action has been validated and we are going to add it to the queue
    @pushEvent({type: EVENTS.before_added_action_to_queue, action: action, gameSession: @})

    if @getIsRunningAsAuthoritative()
      # set action as sub action of parent
      parentAction = @getExecutingParentAction()
      if parentAction?
        parentAction.addSubAction(action)

      # set resolution parent of action
      resolveAction = @getExecutingResolveAction()
      if resolveAction?
        action.setResolveParentAction(resolveAction)

      # set currently executing modifier as parent of action
      # we can't set the action as a triggered action of the modifier yet
      # because the action has no index yet
      triggeringModifier = @getTriggeringModifier()
      action.setTriggeringModifier(triggeringModifier)

      # set action source if it doesn't exist and there is a triggering modifier or an active playing card
      if !action.getSource()?
        if triggeringModifier?
          action.setSource(triggeringModifier.getCard())
        else
          activeCard = @getActiveCard()
          if activeCard?
            action.setSource(activeCard)

    # send an event that an action was just added to the queue
    @pushEvent({type: EVENTS.added_action_to_queue, action: action, gameSession: @}, {blockActionExecution: true})

    if @_private.actionQueue?
      # queue is in progress
      if action.getIsDepthFirst()
        # don't queue depth first actions
        @_executeActionForStep(action, @_private.step)
      else
        # add action to the existing queue
        @_private.actionQueue.push(action)
    else
      if @getIsRunningAsAuthoritative()
        # create a new step
        step = new Step(@, action.getOwnerId())

        # set step index
        stepIndex = @generateIndex()
        step.setIndex(stepIndex)

        # sign step before its actions
        step.addSignature()

        # set step action
        step.setAction(action)

        # queue new step
        @_queueStep(step)

      # try to start next step
      @_startNextStep()

  _queueStep: (step) ->
    if step?
      #Logger.module("SDK").group("STEP #{step.index}")
      Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._queueStep -> ", step.getIndex()
      # link step to parent step as needed
      executingStep = @_private.step
      if executingStep?
        step.setParentStep(executingStep)
        executingStep.setChildStep(step)

      # store the current step
      @_private.stepQueue.push(step)

  _startNextStep: () ->
    if !@_private.step? and @_private.stepQueue.length > 0
      # get step and action
      step = @_private.stepQueue.shift()
      action = step.getAction()
      Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._startNextStep -> #{step.getIndex()} w/ action #{action.getType()}"

      # start step
      @_startStep(step)

      # execute new queue for step with action
      @_executeStepQueue([action])

  _startStep: (step) ->
    if step?
      #Logger.module("SDK").group("STEP #{step.index}")
      # store the current step
      stepIndex = step.getIndex()
      Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._startStep -> ", stepIndex
      @_private.step = step
      @_private.stepsByIndex[stepIndex] = step

      # record the step in the current turn
      @currentTurn.addStep(step)

      # emit event that step is starting
      # note: actions are not allowed in response to this event
      @pushEvent({type: EVENTS.start_step, step: step, gameSession: @}, {blockActionExecution: true})

  _executeStepQueue: (actionQueue) ->
    if @_private.step? and !@_private.actionQueue? and actionQueue?
      # store the new queue
      @_private.actionQueue = actionQueue

      # execute queue
      while actionQueue.length > 0
        # Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._executeStepActionQueue - queue length:#{actionQueue.length}"
        actionToExecute = actionQueue[0]

        # execute action
        @_executeActionForStep(actionToExecute, @_private.step)

        # remove the action we just executed from the queue
        actionQueue.shift()

      # when the queue is done executing
      # end the step and broadcast events
      @_endStep(@_private.step)

  _executeActionForStep: (actionToExecute, step) ->
    # get action properties
    depthFirst = actionToExecute.getIsDepthFirst()
    actionIsFirstTime = actionToExecute.isFirstTime()

    # record depth first actions
    if depthFirst
      @_private.depthFirstActions.push(actionToExecute)

    # update executing action
    lastAction = @getExecutingAction()
    @setExecutingAction(actionToExecute)

    # update parent action
    lastParentAction = @getExecutingParentAction()
    @setExecutingParentAction(actionToExecute)
    lastResolveAction = @getExecutingResolveAction()
    @setExecutingResolveAction(actionToExecute)

    # set action index as needed
    actionIndex = actionToExecute.getIndex()
    if !actionIndex?
      actionIndex = @generateIndex()
      actionToExecute.setIndex(actionIndex)
    Logger.module("SDK").debug "[G:#{@.gameId}]", "GS._executeActionForStep -> ", actionToExecute.type, actionToExecute.index

    #Logger.module("SDK").group("ACTION #{actionToExecute.getLogName()}")

    # record the action
    @_private.actionsByIndex[actionIndex] = actionToExecute

    # add the action to the list of actions we still need to resolve for this step
    @_private.actionsToResolve.push(actionToExecute)

    if actionIsFirstTime
      # set action as resolve sub action of resolution parent
      resolveAction = actionToExecute.getResolveParentAction()
      if resolveAction? then resolveAction.addResolveSubAction(actionToExecute)

    # set the action's as a triggered action of its triggering modifier now that it has an index
    triggeringModifier = actionToExecute.getTriggeringModifier()
    if triggeringModifier? then triggeringModifier.onTriggeredAction(actionToExecute)

    # allow the action to modify itself for execution
    # but don't allow sub actions to be created
    @_private.blockActionExecution = true
    actionToExecute._modifyForExecution()
    @_private.blockActionExecution = false

    # send an event that an action can be modified for execution
    @pushEvent({type: EVENTS.modify_action_for_execution, action: actionToExecute, step: step, gameSession: @}, {blockActionExecution: true})

    # set the action's as a trigger changed action of its triggering modifier now that it has an index
    changedByModifiers = actionToExecute.getChangedByModifiers()
    for modifier in changedByModifiers
      modifier.onTriggerChangedAction(actionToExecute)

    # revealing a hidden card signals start of overwatch
    # in which case events must be buffered until overwatch finishes
    if actionToExecute instanceof RevealHiddenCardAction
      @p_startBufferingEvents()

    # send an event that an action is about to execute and overwatches should trigger
    # note: actions are allowed in response to this event
    @pushBufferableEvent({type: EVENTS.overwatch, action: actionToExecute, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: actionToExecute})

    # send an event that an action is about to execute
    # note: actions are allowed in response to this event
    @pushBufferableEvent({type: EVENTS.before_action, action: actionToExecute, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: actionToExecute})

    # apply mana cost to remaining player mana
    # in case of authoritative, we know how much action will cost before it executes
    # because we have all the information
    if @getIsRunningAsAuthoritative()
      manaCost = actionToExecute.getManaCost()
      if manaCost > 0
        actionToExecute.getOwner().remainingMana -= manaCost

    # start pseudo event: execute
    @pushEventTypeToStack("execute")

    # execute the action
    actionToExecute._execute()

    # execute any authoritative sub actions that occurred during execute event
    if !@getIsRunningAsAuthoritative() then actionToExecute.executeNextOfEventTypeFromAuthoritativeSubActionQueue("execute")

    # stop pseudo event: execute
    @popEventTypeFromStack()

    # apply mana cost to remaining player mana
    # in case of non authoritative, we only know how much action costed after it executes
    if !@getIsRunningAsAuthoritative()
      manaCost = actionToExecute.getManaCost()
      if manaCost > 0
        actionToExecute.getOwner().remainingMana -= manaCost

    # update the current turn
    @currentTurn.updatedAt = Date.now()

    # emit an event that an action has just executed but not yet been signed (most places should listen to this)
    # note: actions are allowed in response to this event
    @pushBufferableEvent({type: EVENTS.action, action: actionToExecute, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: actionToExecute})

    # sign action with current timestamp after it's been executed (this is later used to replay/not generate implicit actions)
    actionToExecute.addSignature()
    @lastActionTimestamp = actionToExecute.timestamp

    # send an event that an action is done executing and signed
    # note: actions are allowed in response to this event
    @pushBufferableEvent({type: EVENTS.after_action, action: actionToExecute, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: actionToExecute})

    if !depthFirst and
      (actionToExecute instanceof DieAction or
      (!@getIsBufferingEvents() and
        !(actionToExecute instanceof ApplyCardToBoardAction or
          actionToExecute instanceof PutCardInDeckAction or
          actionToExecute instanceof PutCardInHandAction or
          actionToExecute instanceof GenerateSignatureCardAction)))
      # send an event that all cached elements should update/flush
      # note: actions are not allowed in response to this event
      @pushBufferableEvent({type: EVENTS.update_cache_action, action: actionToExecute, step: step, gameSession: @}, {resolveAction: actionToExecute, blockActionExecution: true})

    # Logger.module("SDK").groupEnd("ACTION")
    if @_getIsActionQueueEmpty() and !depthFirst
      if @getIsRunningAsAuthoritative()
        # start pseduo event: empty_queue
        @pushEventTypeToStack("empty_queue")

        # the queue is empty so it is safe to execute step resolution
        @p_resolveStep()

        if @_getIsActionQueueEmpty()
          # the queue is empty and we just resolved the step
          if @getIsBufferingEvents() and !(@_private.step.getAction() instanceof RollbackToSnapshotAction)
            if @getIsFollowupActive()
              # when we're at the end of the step and we're retaining rollback data as a result of a followup
              # check if this step's first action has a valid followup
              # if not, create and execute an end followup action
              card = @getValidatorFollowup().getCardWaitingForFollowups()
              if !card? or !card.getCurrentFollowup()? or !card.getPassesConditionsForCurrentFollowup()
                @executeAction(@getCurrentPlayer().actionEndFollowup())
            else
              # stop buffering events as soon as queue is empty
              @executeAction(@actionStopBufferingEvents())
          else if @getCurrentTurn().getEnded()
            # draw cards when turn has ended and queue is empty
            # immediately before starting next turn, draw hand for player whose turn just ended (i.e. current player)
            # this is done before starting next turn so that end turn actions for previous player can act on hand before new cards are drawn
            if !@_private.hasDrawnCardsForTurn
              @_private.hasDrawnCardsForTurn = true
              drawCardActionsForTurn = @getCurrentPlayer().getDeck().actionsDrawNewCards()
              if drawCardActionsForTurn? and drawCardActionsForTurn.length > 0
                drawCardActionsToExecute = drawCardActionsForTurn
                drawCardActionsForTurn = null
                for action in drawCardActionsToExecute
                  @executeAction(action)

            # update end turn duration when turn is ended and queue is empty
            # this must always be the last thing in the end turn phase
            if !@_private.updatedElapsedEndTurn and @_getIsActionQueueEmpty()
              @_private.updatedElapsedEndTurn = true
              # end turn duration change phase: update end turn duration of all modifiers
              # note: actions are allowed in response to this event
              @pushBufferableEvent({type: EVENTS.modifier_end_turn_duration_change, action: actionToExecute, executeAuthoritativeSubActions: false, step: step, gameSession: @}, {resolveAction: actionToExecute})

          else if @_private.startTurnAction?
            # after a new turn has been started, activate the current player's signature card as needed
            # this is done after starting next turn so that end/start turn actions for both players can act on signature cards before activation
            if !@_private.hasActivatedSignatureCardForTurn
              @_private.hasActivatedSignatureCardForTurn = true
              currentPlayer = @getCurrentPlayer()
              if !currentPlayer.getIsSignatureCardActive() and @_getNumberOfTurnsUntilPlayerActivatesSignatureCard(currentPlayer) <= 0
                activateSignatureCardAction = @getCurrentPlayer().actionActivateSignatureCard()
                if activateSignatureCardAction?
                  @executeAction(activateSignatureCardAction)

            # update start turn duration when new turn is started and queue is empty
            # this must always be the last thing in the start turn phase
            if !@_private.updatedElapsedStartTurn and @_getIsActionQueueEmpty()
              @_private.updatedElapsedStartTurn = true
              # start turn duration change phase: update start turn duration of all modifiers
              # note: actions are allowed in response to this event
              @pushBufferableEvent({type: EVENTS.modifier_start_turn_duration_change, action: actionToExecute, executeAuthoritativeSubActions: false, step: step, gameSession: @}, {resolveAction: actionToExecute})

        # end pseudo event: empty_queue
        @popEventTypeFromStack()
      else
        # the queue is empty so it is safe to execute step resolution
        @p_resolveStep()

        if @_getIsActionQueueEmpty()
          # execute any authoritative sub actions that occurred during empty queue
          actionToExecute.executeNextOfEventTypeFromAuthoritativeSubActionQueue("empty_queue")

          # update end turn duration when turn is ended and queue is empty
          if @getCurrentTurn().getEnded() and !@_private.updatedElapsedEndTurn and @_getIsActionQueueEmpty()
            @_private.updatedElapsedEndTurn = true
            # end turn duration change phase: update end turn duration of all modifiers
            # note: actions are allowed in response to this event
            @pushBufferableEvent({type: EVENTS.modifier_end_turn_duration_change, action: actionToExecute, executeAuthoritativeSubActions: true, step: step, gameSession: @}, {resolveAction: actionToExecute})
          else if @_private.startTurnAction? and !@_private.updatedElapsedStartTurn and @_getIsActionQueueEmpty()
            # update start turn duration when new turn is started and queue is empty
            @_private.updatedElapsedStartTurn = true
            # start turn duration change phase: update start turn duration of all modifiers
            # note: actions are allowed in response to this event
            @pushBufferableEvent({type: EVENTS.modifier_start_turn_duration_change, action: actionToExecute, executeAuthoritativeSubActions: true, step: step, gameSession: @}, {resolveAction: actionToExecute})

    # restore actions
    if depthFirst
      @setExecutingAction(lastAction)
      @setExecutingParentAction(lastParentAction)
      @setExecutingResolveAction(lastResolveAction)
    else
      @_private.depthFirstActions.length = 0

    if !@getIsRunningAsAuthoritative() and actionToExecute.getSubActionsQueue()? and actionToExecute.getSubActionsQueue().length > 0
      Logger.module("SDK").error("[G:#{@.gameId}]", "GS._executeActionForStep -> authoritative action #{actionToExecute.getLogName()} did not execute all sub actions:", actionToExecute.getSubActionsQueue().slice(0))

    #Logger.module("SDK").groupEnd("ACTION #{actionToExecute.getLogName()}")

  _resetActionQueue: () ->
    @setExecutingAction(null)
    @setExecutingParentAction(null)
    @setExecutingResolveAction(null)
    @_private.depthFirstActions.length = 0
    @_private.updatedElapsedEndTurn = false
    @_private.updatedElapsedStartTurn = false
    @_private.hasActivatedSignatureCardForTurn = false
    @_private.actionQueue = null

  _executeActionWithForcedParentAction: (action, parentAction) ->
    # retain current parent
    lastAction = @getExecutingAction()
    lastResolveAction = @getExecutingResolveAction()

    # set forced parent
    @setExecutingAction(parentAction)
    @setExecutingResolveAction(parentAction)

    # execute
    @executeAction(action)

    # restore last actions
    @setExecutingAction(lastAction)
    @setExecutingResolveAction(lastResolveAction)

  _getIsActionQueueEmpty: () ->
    # when action queue has 1 left in the queue, because we may want to add more to the queue
    # but we don't want to start a new loop, i.e. if queue is at 0 length when we add more actions
    # do not call this from outside action queue execution
    return !@_private.actionQueue? or @_private.actionQueue.length == 1

  ###*
   * Validate an action for anti-cheat to determine whether it is safe to execute.
   * @param {Action} action
   * @param {Boolean} [emitEventWhenInvalid=true] emits EVENTS.invalid_action if action is invalid
   ###
  validateAction: (action, emitEventWhenInvalid=true) ->
    # Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.validateAction: #{action.getType()}"
    # emit modify action
    # this event allows cards to check an action and modify it before anything else happens
    # for example, followups must be modified before the primary validation event
    # because the card that has the followup is also the one that copies the followup properties into the followup itself
    # as nothing is sent across the net for followups except the id of the followup card, which is done to prevent cheating using followups
    # however, followups should not be validated by their source cards here, because normal validators should get a chance to validate first
    @pushEvent({type: EVENTS.modify_action_for_validation, action:action, gameSession: @}, {blockActionExecution: true})

    # emit validate action
    # this event allows objects across the game session to subscribe and validate that this action can be executed.
    # FOR EXAMPLE: Provoke/Taunt Trait should invalidate any attack actions by units that are nearby to a provoke unit.
    # NOTE: only actions executed by an authoritative source or that have not been executed will be validated
    if @getIsRunningAsAuthoritative() or action.isFirstTime()
      @pushEvent({type: EVENTS.validate_action, action:action, gameSession: @}, {blockActionExecution: true})

    if !action.getIsValid() and emitEventWhenInvalid
      # emit invalid action event
      @onInvalidAction(action, action.getValidatorType(), action.getValidationMessage(), action.getValidationMessagePosition())

  _updateStateAfterActionValidated: (action) ->
    if action instanceof ResignAction or action instanceof EndTurnAction
      # automatic rollback when resign or end turn lands
      @_rollbackToSnapshot()
    else
      # index any cards that will be created
      # this guarantees that even if the card is not applied to a location
      # the game session can operate on the card and its state will be correct
      if action instanceof ApplyCardToBoardAction or action instanceof PutCardInDeckAction or action instanceof PutCardInHandAction or action instanceof GenerateSignatureCardAction
        card = action.getCard()
        if card?
          @_indexCardAsNeeded(card, action.getCardDataOrIndex())

      # start followup when action is non-implicit, playing card with followup
      if action instanceof PlayCardAction and !action.getIsImplicit() and action.getCard()?.getCurrentFollowup()?
        @_startFollowup()

  ###*
   * Handle an invalid action provided by an authoritative source such as the server.
   * NOTE: this should only be called on a NON authoritative source.
   * @param {Object} event
   ###
  onAuthoritativeInvalidAction: (event) ->
    action = @deserializeActionFromFirebase(event?.action)
    if action?
      # reset submitted explicit action now that we know it is invalid
      @_private.submittedExplicitAction = null

      # emit invalid action event
      @onInvalidAction(action, event.validatorType, event.validationMessage, event.validationMessagePosition)

  ###*
   * Handle an invalid action.
   * NOTE: this should only be called on a NON authoritative source.
   * @param {Object} event
   ###
  onInvalidAction: (action, validatorType, validationMessage, validationMessagePosition) ->
    if action?
      Logger.module("SDK").log "[G:#{@.gameId}]", "GS.validateAction INVALID ACTION: #{action.getLogName()} / VALIDATED BY: #{validatorType} / MESSAGE: #{validationMessage}"
      @pushEvent({
        type: EVENTS.invalid_action,
        action:action,
        validatorType: validatorType,
        validationMessage: validationMessage,
        validationMessagePosition: validationMessagePosition,
        gameSession: @
      }, {blockActionExecution: true})

  ###*
   * SDK (package) level method that may be called to resolve the current step.
   * NOTE: only use this during the action execution loop.
   ###
  p_resolveStep: () ->
    actionsToResolve = @_private.actionsToResolve
    if actionsToResolve.length > 0
      Logger.module("SDK").debug("[G:#{@.gameId}]","GameSession.p_resolveStep")
      # note: these events may be emitted multiple times for a step if actions are continually added during this phase
      step = @_private.step
      executingAction = @getExecutingAction()
      @_private.actionsToResolve = []

      # validate game over request if no followup is active
      # game over will be validated before event buffer is flushed
      if @_private.gameOverRequested
        @_validateGameOverRequest()

      # remove actions that may not need to be resolved themselves
      # but because of their execution may need a game session resolve
      firstActionToResolve = actionsToResolve[0]
      if firstActionToResolve instanceof EndTurnAction or firstActionToResolve instanceof StartTurnAction
        actionsToResolve.shift()

      if actionsToResolve.length > 0
        # cleanup phase: trigger cleanup so that removed cards can terminate themselves safely
        # note: actions are not allowed in response to this event
        for action in actionsToResolve
          @pushBufferableEvent({type: EVENTS.cleanup_action, action: action, gameSession: @}, {resolveAction: action})
        # push one pseudo-event for this phase to execute any authoritative sub actions that occurred during cleanup
        if !@getIsRunningAsAuthoritative()
          @pushBufferableEvent({type: EVENTS.cleanup_action, action: executingAction, executeAuthoritativeSubActions: true, gameSession: @}, {resolveAction: executingAction})

        # after cleanup phase: trigger after cleanup for each action for any reactions that should only trigger if the entity is still active
        # note: actions are allowed in response to this event
        for action in actionsToResolve
          @pushBufferableEvent({type: EVENTS.after_cleanup_action, action: action, gameSession: @}, {resolveAction: action})
        # push one pseudo-event for this phase to execute any authoritative sub actions that occurred during after cleanup
        if !@getIsRunningAsAuthoritative()
          @pushBufferableEvent({type: EVENTS.after_cleanup_action, action: executingAction, executeAuthoritativeSubActions: true, gameSession: @}, {resolveAction: executingAction})

        # activate state change phase: change active state of all modifiers
        # note: actions are allowed in response to this event
        @pushBufferableEvent({type: EVENTS.modifier_active_change, action: executingAction, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: executingAction})

        # remove aura phase: remove auras as needed
        # note: actions are allowed in response to this event
        @pushBufferableEvent({type: EVENTS.modifier_remove_aura, action: executingAction, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: executingAction})

        # add aura phase: add auras as needed
        # note: actions are allowed in response to this event
        @pushBufferableEvent({type: EVENTS.modifier_add_aura, action: executingAction, executeAuthoritativeSubActions: !@getIsRunningAsAuthoritative(), step: step, gameSession: @}, {resolveAction: executingAction})

      # check that both players have drawn their starting hands, and if so, update the game status to active
      if @isNew() and @_getIsActionQueueEmpty()
        shouldBecomeActive = true
        for p in @players
          if !p.getHasStartingHand()
            shouldBecomeActive = false

        if shouldBecomeActive
          @setStatus(GameStatus.active)

          # sync state in case there were any changes as a result of the game swapping to active
          @syncState()

  _endStep:(step) ->
    # ensure step is valid
    action = step?.action
    if action? and !action.isFirstTime() and action.getIsValid()
      Logger.module("SDK").debug("[G:#{@.gameId}]", "GS._endStep", step.index)
      #Logger.module("SDK").groupEnd("STEP #{step.index}")
      lastNonDepthFirstAction = @getExecutingNonDepthFirstAction()

      # reset action queue now that we're done
      @_resetActionQueue()

      # send an event that all cached elements should update/flush
      # note: actions are not allowed in response to this event
      if !@getIsBufferingEvents()
        @pushEvent({type: EVENTS.update_cache_step, action: lastNonDepthFirstAction, step: step, gameSession: @}, {resolveAction: lastNonDepthFirstAction, blockActionExecution: true})

      # rollback to snapshot was requested during step
      if @_private.rollbackToSnapshotRequested
        @_rollbackToSnapshot()
      else
        # discard snapshot was requested during step
        if @_private.rollbackSnapshotDataDiscardRequested
          @_discardRollbackSnapshot()

      if !@isOver()
        # start new turn as needed
        if action instanceof EndTurnAction
          if !@_private.startTurnAction?
            # start new turn
            @currentTurn = new GameTurn(@)

            # store start turn action so that it isn't created more than once
            # we know that the start turn action won't be added to the queue until after resolving end turn
            # so we can use start turn action as a reference to know that a new turn is starting
            # and update modifier start turn durations accordingly
            @_private.startTurnAction = @createActionForType(StartTurnAction.type)
            @_private.startTurnAction.setIsAutomatic(true)
            if @swapPlayersOnNewTurn
              @_private.startTurnAction.setOwnerId(@getNonCurrentPlayerId())
            else
              @_private.startTurnAction.setOwnerId(@getCurrentPlayerId())
            @executeAction(@_private.startTurnAction)
        else if action instanceof StartTurnAction
          # reset stored turn values
          @_private.startTurnAction = null
          @_private.hasDrawnCardsForTurn = false

      # emit after_step after everything has had a chance to react to step
      # this way, external listeners can create new steps safely in reaction to steps
      @pushEvent({type: EVENTS.after_step, action: action, step: step, gameSession: @})

      # reset step queue now that we're done
      @_private.lastStep = @_private.step
      @_private.step = null

      # emit step after changing any statuses
      # this way, external listeners know the state of the game as they react
      @pushEvent({type: EVENTS.step, step: step, gameSession: @}, {blockActionExecution: true})

      # terminate game session when game is over
      # otherwise try to start the next step
      if @isOver()
        @terminate()
      else
        @_startNextStep()

  ###*
   * Returns whether there are any steps remaining in queue to be executed.
   * @returns {Boolean}
   ###
  hasStepsInQueue:() ->
    return @_private.stepQueue.length > 0

  ###*
   * Returns whether there are any actions remaining in queue to be executed.
   * @returns {Boolean}
   ###
  hasActionsInQueue:() ->
    return @_private.actionQueue? and @_private.actionQueue.length > 0

  ###*
   * Returns a list of actions in queue to be executed that match the parameters.
   * @param {Class} actionClass class of action to match
   * @param {Vec2|Object} targetPosition target position of the actions
   * @returns {Array}
   ###
  getActionsOfClassInQueue: (actionClass, targetPosition) ->
    actions = []
    actionQueue = @_private.actionQueue
    if actionQueue?
      for action in actionQueue
        if action != @getExecutingAction() and action instanceof actionClass and (!targetPosition or UtilsPosition.getPositionsAreEqual(targetPosition, action.getTargetPosition()))
          actions.push(action)

    return actions

  ###*
   * Returns a list of removal actions in queue to be executed that match the parameters.
   * @param {Vec2|Object} targetPosition target position of the card to be removed
   * @param {String} targetType target type of the card to be removed
   * @returns {Array}
   ###
  getRemovalActionsInQueue: (targetPosition, targetType) ->
    actions = []
    actionQueue = @_private.actionQueue
    if actionQueue?
      for action in actionQueue
        if action != @getExecutingAction() and (action instanceof RemoveAction or action instanceof KillAction)
          target = action.getTarget()
          if target? and (!targetPosition or UtilsPosition.getPositionsAreEqual(targetPosition, target.getPosition())) and (!targetType or target.getType() == CardType.Entity or target.getType() == targetType)
            actions.push(action)

    return actions

  ###*
   * Returns whether a card can be scheduled for removal.
   * @param {Card} card
   * @param {Boolean} [includeExecutingAction=false]
   * @returns {Boolean}
   ###
  getCanCardBeScheduledForRemoval: (card, includeExecutingAction=false) ->
    if card?
      if !card.getIsActive()
        # card has not yet been played or is already removed
        return false
      else
        # card is being removed by the currently executing action
        executingAction = @getExecutingAction()
        if includeExecutingAction and (executingAction instanceof RemoveAction or executingAction instanceof KillAction) and card == executingAction.getTarget()
          return false

        # card may be removed by an action in the queue
        if @_private.actionQueue?
          actionQueue = @_private.actionQueue
          for action in actionQueue
            if action != executingAction and (action instanceof RemoveAction or action instanceof KillAction) and card == action.getTarget()
              return false

    return true

  ###*
   * Returns whether an action was executed during a specific turn.
   * @param {Action} action
   * @param {GameTurn} turn
   * @returns {Boolean}
   ###
  wasActionExecutedDuringTurn: (action, turn) ->
    if action? and turn?
      rootAction = action.getRootAction()
      for step in turn.getSteps()
        if step.getAction()?.getIndex() == rootAction.getIndex()
          # action is sub action of step executed during turn
          return true

    # not found in turn
    return false

  ###*
   * Returns the currently executing action.
   * @returns {Action}
   ###
  getExecutingAction: () ->
    return @_private.action

  setExecutingAction: (val) ->
    @_private.action = val
    if !val? or !val.getIsDepthFirst()
      @setExecutingNonDepthFirstAction(val)

  ###*
   * Returns the currently executing non-depth first action.
   * @returns {Action}
   ###
  getExecutingNonDepthFirstAction: () ->
    return @_private.nonDepthFirstAction

  setExecutingNonDepthFirstAction: (val) ->
    @_private.nonDepthFirstAction = val

  ###*
   * Returns the currently executing resolve action.
   * @returns {Action}
   ###
  getExecutingResolveAction: () ->
    return @_private.resolveAction

  setExecutingResolveAction: (val) ->
    @_private.resolveAction = val

  ###*
   * Returns the currently executing parent action.
   * @returns {Action}
   ###
  getExecutingParentAction: () ->
    return @_private.parentAction

  setExecutingParentAction: (val) ->
    @_private.parentAction = val

  getActionExecutionEventType: () ->
    return @_private.actionExecutionEventType || "execute"

  setActionExecutionEventType: (val) ->
    @_private.actionExecutionEventType = val

  getActionExecutionEventTypeStack: () ->
    return @_private.actionExecutionEventTypeStack

  ###*
   * Returns an action by index.
   * @param {Number} index
   * @returns {Action}
   ###
  getActionByIndex:(index) ->
    if index?
      return @_private.actionsByIndex[index]

  ###*
   * Returns an array copy of the master map of actions.
   * @returns {Array}
   ###
  getActions:() ->
    actions = []
    actionIndices = Object.keys(@_private.actionsByIndex)
    for index in actionIndices
      action = @_private.actionsByIndex[index]
      if action?
        actions.push(action)
    return actions

  ###*
   * Returns an array of all actions in the master map of actions that pass a filter method.
   * NOTE: filter method is passed the action and must return true or false.
   * @returns {Array}
   ###
  filterActions: (byMethod) ->
    actions = []
    actionIndices = Object.keys(@_private.actionsByIndex)
    for index in actionIndices
      action = @_private.actionsByIndex[index]
      if action? and byMethod(action)
        actions.push(action)
    return actions

  ###*
   * Returns the first action in the master map of actions that passes a find method.
   * NOTE: find method is passed the action and must return true or false.
   * @returns {Array}
   ###
  findAction: (byMethod) ->
    actionIndices = Object.keys(@_private.actionsByIndex)
    for index in actionIndices
      action = @_private.actionsByIndex[index]
      if action? and byMethod(action)
        return action

  ###*
   * Returns an array of actions that match an array of indices.
   * @param {Array} indices
   * @returns {Array}
   ###
  getActionsByIndices:(indices) ->
    actions = []

    if indices?
      for index in indices
        action = @getActionByIndex(index)
        if action? then actions.push(action)

    return actions

  ###*
   * Returns the current step executing.
   * @returns {Step}
   ###
  getExecutingStep: () ->
    return @_private.step

  ###*
   * Returns a step by index.
   * @param {Number} index
   * @returns {Step}
   ###
  getStepByIndex:(index) ->
    if index?
      return @_private.stepsByIndex[index]

  ###*
   * Returns an array copy of the master map of steps.
   * @returns {Array}
   ###
  getSteps:() ->
    steps = []
    stepIndices = Object.keys(@_private.stepsByIndex)
    for index in stepIndices
      step = @_private.stepsByIndex[index]
      if step?
        steps.push(step)
    return steps

  ###*
   * Total step count.
   * @returns {Number}
   ###
  getStepCount:() ->
    return Object.keys(@_private.stepsByIndex).length

  ###*
   * Returns an array of steps that match an array of indices.
   * @param {Array} indices
   * @returns {Array}
   ###
  getStepsByIndices:(indices) ->
    steps = []

    if indices?
      for index in indices
        step = @getStepByIndex(index)
        if step? then steps.push(step)

    return steps

  ###*
   * Returns the currently executing root action.
   * @returns {Action}
   ###
  getExecutingRootAction: () ->
    return @_private.step?.getAction()

  ###*
   * Returns the last step executed.
   * @returns {Step}
   ###
  getLastStep: () ->
    return @_private.lastStep

  ###*
   * Returns the step that ended the game.
   * @returns {Step}
   ###
  getGameEndingStep: () ->
    if @isOver()
      if @_private.step?
        return @_private.step
      else if @_private.lastStep?
        return @_private.lastStep

  ###*
   * Returns a random integer from a range action execution and flags the currently executing action and step as including randomness.
   * @param {Number} [max=1]
   * @param {Number} [min=0]
   * @returns {Number}
   ###
  getRandomIntegerForExecution: (max=1.0, min=0.0) ->
    randomNumber = min + Math.floor(Math.random() * (max - min))
    @getExecutingAction()?.setIncludedRandomness(true)
    @getExecutingStep()?.setIncludedRandomness(true)
    return randomNumber

  # endregion steps and actions

  # region factory methods

  createActionForType:(actionType) ->
    return ActionFactory.actionForType(actionType, @)

  createCardForIdentifier:(identifier) ->
    return CardFactory.cardForIdentifier(identifier, @)

  ###*
   * Returns an existing card matching an index, or a cached card from card data by id.
   * NOTE: this method never creates a new card. All cards returned from this method are either indexed or cached.
   * @param {Object|Number|String} cardDataOrIndex plain object of card data with at least an "id" property or a card index
   * @returns {Card}
   ###
  getExistingCardFromIndexOrCachedCardFromData: (cardDataOrIndex) ->
    if cardDataOrIndex?
      if _.isObject(cardDataOrIndex)
        # attempt to find indexed card
        index = cardDataOrIndex.index
        if index?
          card = @getCardByIndex(index)

        # get cached card
        if !card? and cardDataOrIndex.id? and cardDataOrIndex.id != -1
          card = @getCardCaches().getCardById(cardDataOrIndex.id)
      else
        # attempt to find indexed card
        card = @getCardByIndex(cardDataOrIndex)

      return card

  ###*
   * Returns an existing card matching an index, or creating a new card from card data by id.
   * @param {Object|Number|String} cardDataOrIndex plain object of card data with at least an "id" property or a card index
   * @returns {Card}
   ###
  getExistingCardFromIndexOrCreateCardFromData: (cardDataOrIndex) ->
    if cardDataOrIndex?
      if _.isObject(cardDataOrIndex)
        # attempt to find indexed card
        index = cardDataOrIndex.index
        if index?
          card = @getCardByIndex(index)

        # create new card
        if !card? and cardDataOrIndex.id? and cardDataOrIndex.id != -1
          card = @createCardForIdentifier(cardDataOrIndex.id)
      else
        # attempt to find indexed card
        card = @getCardByIndex(cardDataOrIndex)

      return card

  ###*
   * Indexes a card using a provided index or generates a new index as needed.
   * NOTE: do not call this method directly, instead use applyCardToDeck, applyCardToHand, or applyCardToBoard.
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Object|Number|String} [cardDataOrIndex=null]
   * @returns {Number|String} index
   * @private
   ###
  _indexCardAsNeeded: (card, cardDataOrIndex) ->
    if card?
      index = card.getIndex()

    if !index?
      if cardDataOrIndex?
        if _.isObject(cardDataOrIndex) then index = cardDataOrIndex.index else index = cardDataOrIndex

    index ?= @generateIndex()

    if card? and !@cardsByIndex[index]?
      # record card
      @cardsByIndex[index] = card
      card.setIndex(index)

      # flush card caches
      card.getOwner().flushAllCachedCards()

    return index

  ###*
   * Injects a card with prismatic and skin properties if needed based on the source action that created it.
   * NOTE: do not call this method directly, instead use applyCardToDeck, applyCardToHand, or applyCardToBoard.
   * @param {Card} card
   * @param {Action} sourceAction
   * @private
   ###
  _injectSkinAndPrismaticPropertiesIntoCard: (card, sourceAction) ->
    if card? and sourceAction? and !(sourceAction instanceof DrawCardAction)
      # get card current id
      cardId = card.getId()

      # triggering modifier
      triggeringModifier = sourceAction.getTriggeringModifier()
      if triggeringModifier?
        if triggeringModifier.getCanConvertCardToPrismatic()
          refCard = if triggeringModifier.getIsInherent() then triggeringModifier.getCardAffected() else triggeringModifier.getSourceCard()
          if refCard? and Cards.getIsPrismaticCardId(refCard.getId())
            cardId = Cards.getPrismaticCardId(cardId)

        if triggeringModifier.getCanConvertCardToSkinned()
          refCard = triggeringModifier.getSourceCard()
          if refCard?
            refCardId = refCard.getId()
            if Cards.getBaseCardId(refCardId) == Cards.getBaseCardId(cardId) and Cards.getIsSkinnedCardId(refCardId)
              skinNum = Cards.getCardSkinNum(refCardId)
              cardId = Cards.getSkinnedCardId(cardId, skinNum)
              CosmeticsFactory.injectSkinPropertiesIntoCard(card, Cards.getCardSkinIdForCardId(cardId))

      # root card
      rootAction = sourceAction.getRootAction()
      if rootAction != sourceAction and rootAction.getCard?
        rootPlayedCard = rootAction.getCard()
        if rootPlayedCard? and rootPlayedCard.getType() is CardType.Spell and rootPlayedCard.getCanConvertCardToPrismatic()
          refCard = if rootPlayedCard.getIsFollowup() then rootPlayedCard.getRootCard() else rootPlayedCard
          if refCard? and Cards.getIsPrismaticCardId(refCard.getId())
            cardId = Cards.getPrismaticCardId(cardId)

      # set preserved card id
      if cardId != card.getId()
        card.setId(cardId)

  getCardFactory:() ->
    # method used internally to avoid circular dependencies
    return CardFactory

  getCardCaches:(systemTime) ->
    # method used internally to avoid circular dependencies
    return GameSession.getCardCaches(systemTime)

  createModifierForType:(modifierType) ->
    return ModifierFactory.modifierForType(modifierType, @)

  getModifierClassForType:(modifierType) ->
    return ModifierFactory.modifierClassForType(modifierType)

  getModifierFactory:() ->
    # method used internally to avoid circular dependencies
    return ModifierFactory

  ###*
   * Returns a modifier from context object or index, creating a new modifier whenever necessary.
   * @param {Object|Number|String} contextObjectOrIndex context object with at least a "type" property or a modifier index
   * @returns {Modifier}
   ###
  getOrCreateModifierFromContextObjectOrIndex: (contextObjectOrIndex) ->
    if contextObjectOrIndex?
      if _.isObject(contextObjectOrIndex)
        # attempt to find indexed modifier
        index = contextObjectOrIndex.index
        if index?
          modifier = @getModifierByIndex(index)

        # create modifier
        if !modifier? and contextObjectOrIndex.type?
          modifier = @createModifierForType(contextObjectOrIndex.type)
      else
        # attempt to find indexed modifier
        modifier = @getModifierByIndex(contextObjectOrIndex)

      return modifier

  ###*
   * Returns a modifier from context object or index, creating a new modifier whenever necessary and applying the context object.
   * @param {Object|Number|String} contextObjectOrIndex context object with at least a "type" property or a modifier index
   * @returns {Modifier}
   ###
  getOrCreateModifierFromContextObjectOrIndexAndApplyContextObject: (contextObjectOrIndex) ->
    if contextObjectOrIndex?
      if _.isObject(contextObjectOrIndex)
        # attempt to find indexed modifier
        index = contextObjectOrIndex.index
        if index?
          modifier = @getModifierByIndex(index)

        # create modifier
        if !modifier? and contextObjectOrIndex.type?
          modifier = @createModifierForType(contextObjectOrIndex.type)
          # copy data so we don't modify anything unintentionally
          modifierContextObject = UtilsJavascript.fastExtend({}, contextObjectOrIndex)
          modifier.applyContextObject(modifierContextObject)
      else
        # attempt to find indexed modifier
        modifier = @getModifierByIndex(contextObjectOrIndex)

      return modifier

  ###*
   * Indexes a modifier using a provided index or generates a new index as needed.
   * NOTE: do not call this method directly, instead use applyModifierContextObject.
   * @param {Modifier} modifier
   * @param {Object|Number|String} [contextObjectOrIndex=null]
   * @returns {Number|String} index
   * @private
   ###
  _indexModifierAsNeeded: (modifier, contextObjectOrIndex) ->
    if modifier?
      index = modifier.getIndex()

    if !index?
      if contextObjectOrIndex?
        if _.isObject(contextObjectOrIndex) then index = contextObjectOrIndex.index else index = contextObjectOrIndex

    index ?= @generateIndex()

    if modifier? and !@modifiersByIndex[index]?
      # record modifier
      @modifiersByIndex[index] = modifier
      modifier.setIndex(index)

      # flush card modifier caches
      modifier.getCard()?.flushCachedModifiers()

    return index

  # endregion factory methods

  # region cards

  _removeCardFromCurrentLocation: (card, cardIndex, sourceAction) ->
    if !card? and cardIndex?
      card = @getCardByIndex(card)

    if card?
      owner = card.getOwner()
      if card.getIsLocatedInDeck()
        indexRemoved = @removeCardByIndexFromDeck(owner.getDeck(), cardIndex, card, sourceAction)
        if indexRemoved? then return indexRemoved
        else return @removeCardByIndexFromDeck(@getOpponentPlayerOfPlayerId(owner.getPlayerId()).getDeck(), cardIndex, card, sourceAction)
      else if card.getIsLocatedInHand()
        indexRemoved = @removeCardByIndexFromHand(owner.getDeck(), cardIndex, card, sourceAction)
        if indexRemoved? then return indexRemoved
        else return @removeCardByIndexFromHand(@getOpponentPlayerOfPlayerId(owner.getPlayerId()).getDeck(), cardIndex, card, sourceAction)
      else if card.getIsLocatedInSignatureCards()
        return @removeCardFromSignatureCards(card, sourceAction)
      else if card.getIsLocatedOnBoard()
        position = card.getPosition()
        return @removeCardFromBoard(card, position.x, position.y, sourceAction)
    else
      # no card in this game session means the card can only be in hand or deck
      player1 = @getPlayer1()
      player1Deck = player1.getDeck()
      indexRemoved = @removeCardByIndexFromDeck(player1Deck, cardIndex, card, sourceAction)
      if indexRemoved? then return indexRemoved
      indexRemoved = @removeCardByIndexFromHand(player1Deck, cardIndex, card, sourceAction)
      if indexRemoved? then return indexRemoved

      player2 = @getPlayer2()
      player2Deck = player2.getDeck()
      indexRemoved = @removeCardByIndexFromDeck(player2Deck, cardIndex, card, sourceAction)
      if indexRemoved? then return indexRemoved
      indexRemoved = @removeCardByIndexFromHand(player2Deck, cardIndex, card, sourceAction)
      if indexRemoved? then return indexRemoved

  ###*
   * Applies a card by index to a deck.
   * @param {Deck} deck
   * @param {Object|Number|String} [cardDataOrIndex=null]
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Action} [sourceAction=null] action that applied the card
   ###
  applyCardToDeck: (deck, cardDataOrIndex, card, sourceAction) ->
    if deck?
      if card?
        # apply card data received
        card.applyCardData(cardDataOrIndex)

        # attempt to retain prismatic and skinned states
        @_injectSkinAndPrismaticPropertiesIntoCard(card, sourceAction)

      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.applyCardToDeck ->", card?.getLogName(), "by action", sourceAction?.getLogName())

      # index card
      cardIndex = @_indexCardAsNeeded(card, cardDataOrIndex)

      # remove card from current location
      @_removeCardFromCurrentLocation(card, cardIndex, sourceAction)

      # add card index to deck
      deck.putCardIndexIntoDeck(cardIndex)

      if card?
        # push card to stack and start pseudo event: apply_card_to_deck
        @pushEventTypeToStack("apply_card_to_deck")
        @pushCardToStack(card)

        # apply the card to the deck
        card.onApplyToDeck(deck, sourceAction)

        # execute any authoritative sub actions that occurred during apply_card_to_deck event
        if !@getIsRunningAsAuthoritative() and @getExecutingAction()? then @getExecutingAction().executeNextOfEventTypeFromAuthoritativeSubActionQueue("apply_card_to_deck")

        # stop pseudo event: apply_card_to_deck
        @popCardFromStack(card)
        @popEventTypeFromStack()

        # sync the game state if this change occurred via a non-action source
        # normally game state is cached and synced in response to action events
        # so if a non-action changes game state, then a manual sync is needed
        if !sourceAction?
          @syncState()

  ###*
   * Removes a card by index from a deck.
   * @param {Deck} deck
   * @param {Number|String} cardIndex
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Action} [sourceAction=null] action that removed the card
   * @returns {Number|null} index in deck card was removed from, or null if not removed
   ###
  removeCardByIndexFromDeck: (deck, cardIndex, card, sourceAction) ->
    indexOfCardInDeck = null
    if cardIndex? and deck?
      # attempt to remove the card index from the deck
      indexOfCardInDeck = deck.removeCardIndexFromDeck(cardIndex)
    #Logger.module("SDK").debug("[G:#{@gameId}]","GS.removeCardByIndexFromDeck ->", card?.getLogName(), "at index", indexOfCardInDeck, "for deck", deck?, "by action", sourceAction?.getLogName())
    # if the card data was removed
    if indexOfCardInDeck? and card?
      # remove the card from the deck
      card.onRemoveFromDeck(deck, sourceAction)

      # sync the game state if this change occurred via a non-action source
      # normally game state is cached and synced in response to action events
      # so if a non-action changes game state, then a manual sync is needed
      if !sourceAction?
        @syncState()

    return indexOfCardInDeck

  ###*
   * Applies a card by index to a hand.
   * @param {Deck} deck
   * @param {Object|Number|String} [cardDataOrIndex=null]
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Boolean} [indexInHand=null] whether to put the card into a specific index of hand
   * @param {Action} [sourceAction=null] action that applied the card
   * @param {Boolean} [burnCard=false] if card should always be burned immediately regardless of space left in hand
   * @returns {Number|null} index in hand card was applied to, or null if not applied
   ###
  applyCardToHand: (deck, cardDataOrIndex, card, indexInHand, sourceAction, burnCard=false) ->
    if deck?
      if card?
        # apply card data received
        card.applyCardData(cardDataOrIndex)

        # attempt to retain prismatic and skinned states
        @_injectSkinAndPrismaticPropertiesIntoCard(card, sourceAction)

      # index card
      cardIndex = @_indexCardAsNeeded(card, cardDataOrIndex)

      # remove card from current location
      @_removeCardFromCurrentLocation(card, cardIndex, sourceAction)

      if burnCard
        indexInHand = null
      else
        # add card data to hand
        if indexInHand?
          deck.putCardIndexInHandAtIndex(cardIndex, indexInHand)
        else
          indexInHand = deck.putCardIndexInHand(cardIndex)

      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.applyCardToHand ->", card?.getLogName(), "by action", sourceAction?.getLogName(), "at index", indexInHand)
      if card?
        # push card to stack and start pseudo event: apply_card_to_hand
        @pushEventTypeToStack("apply_card_to_hand")
        @pushCardToStack(card)

        if !indexInHand?
          # burned from hand
          card.onRemoveFromHand(deck, sourceAction)
        else
          # apply the card to the hand
          card.onApplyToHand(deck, sourceAction)

        # execute any authoritative sub actions that occurred during apply_card_to_hand event
        if !@getIsRunningAsAuthoritative() and @getExecutingAction()? then @getExecutingAction().executeNextOfEventTypeFromAuthoritativeSubActionQueue("apply_card_to_hand")

        # stop pseudo event: apply_card_to_hand
        @popCardFromStack(card)
        @popEventTypeFromStack()

        # sync the game state if this change occurred via a non-action source
        # normally game state is cached and synced in response to action events
        # so if a non-action changes game state, then a manual sync is needed
        if !sourceAction?
          @syncState()
        else
          if indexInHand?
            # force record state for card just after applying
            card.setupActionStateRecord()
            card.getActionStateRecord()?.recordStateEvenIfNotChanged(sourceAction.getIndex())

          if !@getIsBufferingEvents()
            # send an event that all cached elements should update/flush
            # note: actions are not allowed in response to this event
            @pushEvent({type: EVENTS.update_cache_action, action: sourceAction, step: @getExecutingStep(), gameSession: @}, {resolveAction: sourceAction, blockActionExecution: true})

    return indexInHand

  ###*
   * Removes a card by index from a deck.
   * @param {Deck} deck
   * @param {Number|String} cardIndex
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Action} [sourceAction=null] action that removed the card
   * @returns {Number|null} index in hand card was removed from, or null if not removed
   ###
  removeCardByIndexFromHand: (deck, cardIndex, card, sourceAction) ->
    indexOfCardInHand = null
    if deck? and cardIndex?
      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.removeCardByIndexFromHand ->", card?.getLogName(), "by action", sourceAction?.getLogName())

      # attempt to remove the card data
      # in the case of opponent card actions
      # it is possible the card is null but the card data is defined
      indexOfCardInHand = deck.removeCardIndexFromHand(cardIndex)

    # if the card data was removed
    if indexOfCardInHand?
      if card?
        # remove the card from the deck
        card.onRemoveFromHand(deck, sourceAction)

        # sync the game state if this change occurred via a non-action source
        # normally game state is cached and synced in response to action events
        # so if a non-action changes game state, then a manual sync is needed
        if !sourceAction?
          @syncState()

    return indexOfCardInHand

  ###*
   * Applies a card by index to signature cards.
   * @param {Card} [card=null] card may be null in case of non-authoritative session
   * @param {Object|Number|String} [cardDataOrIndex=null]
   * @param {Action} [sourceAction=null] action that applied the card
   ###
  applyCardToSignatureCards: (card, cardDataOrIndex, sourceAction) ->
    if card?
      owner = card.getOwner()
      if !(owner instanceof Player)
        Logger.module("SDK").error "[G:#{@.gameId}]", "GS.applyCardToSignatureCards -> cannot apply card without an owner to signature slot!"

      # apply card data received
      card.applyCardData(cardDataOrIndex)

      # attempt to retain prismatic and skinned states
      @_injectSkinAndPrismaticPropertiesIntoCard(card, sourceAction)
      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.applyCardToSignatureCards ->", card.getLogName(), "by action", sourceAction?.getLogName())

      # index card
      cardIndex = @_indexCardAsNeeded(card, card.getIndex() || cardDataOrIndex)

      # push card to stack and start pseudo event: apply_card_to_signature_cards
      @pushEventTypeToStack("apply_card_to_signature_cards")
      @pushCardToStack(card)

      # remove card from current location
      @_removeCardFromCurrentLocation(card, cardIndex, sourceAction)

      # add card data to owner signature cards list
      owner.addSignatureCard(card)

      # apply the card to the signature cards
      card.onApplyToSignatureCards(sourceAction)

      # execute any authoritative sub actions that occurred during apply_card_to_signature_cards event
      if !@getIsRunningAsAuthoritative() and @getExecutingAction()? then @getExecutingAction().executeNextOfEventTypeFromAuthoritativeSubActionQueue("apply_card_to_signature_cards")

      # stop pseudo event: apply_card_to_signature_cards
      @popCardFromStack(card)
      @popEventTypeFromStack()

      # sync the game state if this change occurred via a non-action source
      # normally game state is cached and synced in response to action events
      # so if a non-action changes game state, then a manual sync is needed
      if !sourceAction?
        @syncState()
      else
        # force record state for card just after applying
        card.setupActionStateRecord()
        card.getActionStateRecord()?.recordStateEvenIfNotChanged(sourceAction.getIndex())

        if !@getIsBufferingEvents()
          # send an event that all cached elements should update/flush
          # note: actions are not allowed in response to this event
          @pushEvent({type: EVENTS.update_cache_action, action: sourceAction, step: @getExecutingStep(), gameSession: @}, {resolveAction: sourceAction, blockActionExecution: true})

  ###*
   * Removes a card from a player's signature slot.
   * @param {Card} card
   * @param {Action} [sourceAction=null] action that removed the card
   * @returns {Number|null} index in signature cards card was removed from, or null if not removed
   ###
  removeCardFromSignatureCards: (card, sourceAction) ->
    indexOfCardInSignatureCards = null
    if card?
      owner = card.getOwner()
      if !(owner instanceof Player)
        Logger.module("SDK").error "[G:#{@.gameId}]", "GS.removeCardFromSignatureCards -> cannot remove card without an owner from signature slot!"

      # attempt to remove the card data
      indexOfCardInSignatureCards = owner.removeSignatureCard(card)
      Logger.module("SDK").debug("[G:#{@gameId}]","GS.removeCardFromSignatureCards ->", card.getLogName(), "by action", sourceAction?.getLogName(), "from index", indexOfCardInSignatureCards)

      # remove the card from signature cards
      card.onRemoveFromSignatureCards(sourceAction)

      # sync the game state if this change occurred via a non-action source
      # normally game state is cached and synced in response to action events
      # so if a non-action changes game state, then a manual sync is needed
      if !sourceAction?
        @syncState()

    return indexOfCardInSignatureCards

  ###*
   * Applies a card to the board at a given location.
   * @param {Card} card card to apply
   * @param {Number} x x position
   * @param {Number} y y position
   * @param {Object|Number|String} [cardDataOrIndex=null]
   * @param {Action} [sourceAction=null] action that applied the card
   ###
  applyCardToBoard: (card, x, y, cardDataOrIndex, sourceAction) ->
    isValidApplication = false

    if card? and !card.getIsActive()
      # apply card data received
      card.applyCardData(cardDataOrIndex)

      # attempt to retain prismatic and skinned states
      @_injectSkinAndPrismaticPropertiesIntoCard(card, sourceAction)
      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.applyCardToBoard ->", card?.getLogName(), "at (#{x}, #{y}) by action", sourceAction?.getLogName())

      # index data
      cardIndex = @_indexCardAsNeeded(card, card.getIndex() || cardDataOrIndex)

      # check whether card application is valid
      targetPosition = {x: x, y: y}
      isValidApplication = @getBoard().isOnBoard(targetPosition) and
          (!CardType.getIsEntityCardType(card.getType()) or
            !@getBoard().getObstructionAtPositionForEntity(targetPosition, card) or
            @getExecutingAction() instanceof PlayCardFromHandAction and card.hasModifierClass(ModifierCustomSpawn))

      if sourceAction? and isValidApplication
        # force record state for card just before applying
        card.setupActionStateRecord()
        card.getActionStateRecord()?.recordStateEvenIfNotChanged(sourceAction.getIndex())

        if !@getIsBufferingEvents()
          # send an event that all cached elements should update/flush
          # note: actions are not allowed in response to this event
          @pushEvent({type: EVENTS.update_cache_action, action: sourceAction, step: @getExecutingStep(), gameSession: @}, {resolveAction: sourceAction, blockActionExecution: true})

      # push card to stack and start pseudo event: apply_card_to_board
      @pushEventTypeToStack("apply_card_to_board")
      @pushCardToStack(card)

      # remove card from current location
      @_removeCardFromCurrentLocation(card, cardIndex, sourceAction)

      if isValidApplication
        # store a reference to this action with the card that it applied
        card.setAppliedToBoardByAction(sourceAction)

        # set card as sub-card of parent card
        parentCard = card.getParentCard()
        if parentCard?
          parentCard.addSubCard(card)

        # handle state by card type before formally applying card
        # this is important for destroying previous cards
        if card.getType() == CardType.Tile
          # check for existing tile at position and kill it
          # this works because the search always returns the first tile found
          existingTile = @board.getTileAtPosition(targetPosition, true)
          if existingTile?
            #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.playCard - kill existing tile #{existingTile.getName()} at grid(#{position.x}, #{position.y})"
            @executeAction(existingTile.actionDie(card))

        # add card to board
        # must be done before setting card as applied
        # in case card triggers anything as a result
        @board.addCard(card)

        # set card as applied to board
        card.onApplyToBoard(@board, x, y, sourceAction)

        # check if card was an entity that died during apply
        if card.getType() == CardType.Entity and card.getHP() <= 0 and @getCanCardBeScheduledForRemoval(card)
          @executeAction(card.actionDie())

      # execute any authoritative sub actions that occurred during apply_card_to_board event
      if !@getIsRunningAsAuthoritative() and @getExecutingAction()? then @getExecutingAction().executeNextOfEventTypeFromAuthoritativeSubActionQueue("apply_card_to_board")

      # stop pseudo event: apply_card_to_board
      @popCardFromStack(card)
      @popEventTypeFromStack()

      # auto remove cards from the board that are:
      # - not valid applications
      # - not entities (ex: spells, artifacts)
      if !isValidApplication or !(card instanceof Entity)
        @removeCardFromBoard(card, x, y, sourceAction)
      else if !sourceAction?
        # sync the game state if this change occurred via a non-action source
        # normally game state is cached and synced in response to action events
        # so if a non-action changes game state, then a manual sync is needed
        @syncState()

    return isValidApplication

  ###*
   * Removes a card from the board at a given location.
   * @param {Card} card card to remove
   * @param {Number} x x position
   * @param {Number} y y position
   * @param {Action} [sourceAction=null] action that applied the card
   ###
  removeCardFromBoard: (card, x, y, sourceAction) ->
    if card? and card.getIsActive()
      #Logger.module("SDK").debug("[G:#{@gameId}]","GS.removeCardFromBoard ->", card?.getLogName(), "at (#{x}, #{y}) by action", sourceAction?.getLogName())
      # remove the card from the board
      # must be done before setting card as removed
      # in case card triggers anything as a result
      @board.removeCard(card)

      # set card as removed
      card.onRemoveFromBoard(@board, x, y, sourceAction)

      # when removed by a die action
      if sourceAction instanceof DieAction
        # record total minions killed so far by this player
        if !card.getIsGeneral()
          opponent = _.find(@.players,(p)-> p.playerId != card.getOwnerId())
          opponent?.totalMinionsKilled += 1

      # sync the game state if this change occurred via a non-action source
      # normally game state is cached and synced in response to action events
      # so if a non-action changes game state, then a manual sync is needed
      if !sourceAction?
        @syncState()

  getActiveCard: () ->
    return @_private.cardStack[@_private.cardStack.length - 1]

  pushCardToStack: (card) ->
    @_private.cardStack.push(card)

  popCardFromStack: () ->
    @_private.cardStack.pop()

  ###*
   * Returns an array copy of the master map of cards.
   * @returns {Array}
   ###
  getCards:() ->
    cards = []
    cardIndices = Object.keys(@cardsByIndex)
    for index in cardIndices
      card = @cardsByIndex[index]
      if card?
        cards.push(card)
    return cards

  ###*
   * Returns a card that matches the index.
   * @param {Number|String} index
   * @returns {Card|Null}
   ###
  getCardByIndex:(index) ->
    if index?
      return @cardsByIndex[index]

  ###*
   * Returns an array of cards that match an array of indices.
   * NOTE: may contain null values if cards do not exist for indices.
   * @param {Array} indices
   * @returns {Array}
   ###
  getCardsByIndices:(indices) ->
    cards = []

    if indices?
      for index in indices
        cards.push(@getCardByIndex(index))

    return cards

  ###*
   * Returns a list of cards played to board in order of play.
   * @param {String} [playerId=null] player that played the cards, or both if no playerId provided
   * @param {Class} [cardClass=Card] class of cards to get
   * @returns {Array}
   ###
  getCardsPlayed: (playerId, cardClass) ->
    cards = []
    cardClass ?= Card
    sortingMethod = (card) -> return card.getAppliedToBoardByActionIndex()

    # get all cards that have been played by a player
    # sort by played index
    for card in @getCards()
      if card instanceof cardClass and card.getOwnerId()? and (!playerId? or card.getOwnerId() == playerId) and card.getIsPlayed()
        UtilsJavascript.arraySortedInsertAscendingByScore(cards, card, sortingMethod)

    return cards

  ###*
   * Returns a list of units played to board in order of play.
   * @see getCardsPlayed
   * @returns {Array}
   ###
  getUnitsPlayed: (playerId) ->
    return @getCardsPlayed(playerId, Unit)

  ###*
   * Returns a list of artifacts played to board in order of play.
   * @see getCardsPlayed
   * @returns {Array}
   ###
  getArtifactsPlayed: (playerId) ->
    return @getCardsPlayed(playerId, Artifact)

  ###*
   * Returns a list of spells played to board in order of play.
   * @see getCardsPlayed
   * @returns {Array}
   ###
  getSpellsPlayed: (playerId) ->
    return @getCardsPlayed(playerId, Spell)

  ###*
   * Returns a list of dead units in order death.
   * NOTE: this is an expensive method, so it is recommended that the return value be cached whenever possible!
   * @param {String} [playerId=null] player that played the cards, or both if no playerId provided
   * @param {String} [searchUntilLastTurnOfPlayerId=null] whether to search only until last turn of a player id
   * @returns {Array}
   ###
  getDeadUnits: (playerId, searchUntilLastTurnOfPlayerId) ->
    deadUnits = []

    # find actions to check
    actions = []
    currentTurn = @getGameSession().getCurrentTurn()
    turns = [].concat(@getGameSession().getTurns(), currentTurn)
    for turn, i in turns by -1
      if searchUntilLastTurnOfPlayerId? and turn != currentTurn and turn.getPlayerId() is searchUntilLastTurnOfPlayerId
        break
      else
        for step in turn.getSteps()
          actions = actions.concat(step.getAction().getFlattenedActionTree())

    for action in actions
      if action instanceof DieAction
        card = action.getTarget()
        if card instanceof Unit and card.getIsRemoved() and (!playerId? or card.getOwnerId() == playerId) and !(card.getRarityId() is Rarity.TokenUnit) and !card.getWasGeneral()
          deadUnits.push(card)

    return deadUnits

  # endregion cards

  # region modifiers

  ###*
   * Applies a modifier context object to a card, attempting to apply via action whenever possible.
   * @param {Object} modifierContextObject context object for modifier to apply
   * @param {Card} card card to apply modifier to
   * @param {Modifier} [parentModifier=null] parentModifier that applied this modifier
   * @param {Number} [auraModifierId=null] identifier for which modifier in the parentModifier aura this is
   ###
  applyModifierContextObject: (modifierContextObject, card, parentModifier, auraModifierId) ->
    if modifierContextObject? and card instanceof Card and (@getIsRunningAsAuthoritative() or modifierContextObject.index?)
      if @_private.actionQueue? and !modifierContextObject.index?
        # non-indexed modifiers should apply via action when applied during action execution
        applyModifierAction = new ApplyModifierAction(@, modifierContextObject, card, parentModifier, auraModifierId)
        @executeAction(applyModifierAction)
      else
        # modifiers can apply instantly when no actions executing
        # copy data so we don't modify anything unintentionally
        modifierContextObject = UtilsJavascript.fastExtend({}, modifierContextObject)
        modifier = @getOrCreateModifierFromContextObjectOrIndex(modifierContextObject)
        @p_applyModifier(modifier, card, parentModifier, modifierContextObject, auraModifierId)

  ###*
   * SDK (package) level method that applies a modifier to a card instantly.
   * NOTE: do not call this method directly, instead use applyModifierContextObject.
   * @see applyModifierContextObject
   ###
  p_applyModifier: (modifier, card, parentModifier, modifierContextObject, auraModifierId) ->
    if card instanceof Card and modifier instanceof Modifier and !card.getIsRemoved() and !modifier.getIsRemoved()
      # ensure player modifiers are valid
      if modifier instanceof PlayerModifier and (!(card instanceof Entity) or !card.getIsGeneral())
        Logger.module("SDK").error "[G:#{@.gameId}]", "GS.applyModifierContextObject -> cannot apply player modifier to non-general!"

      # apply context object received
      modifier.applyContextObject(modifierContextObject)

      # index modifier
      @_indexModifierAsNeeded(modifier, modifierContextObject)
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_applyModifier -> #{modifier.getLogName()} to #{card.getLogName()}"

      # set parent/child relationship
      parentModifier ?= modifier.getParentModifier()
      if parentModifier instanceof Modifier
        parentModifier.addSubModifier(modifier)

        # source card is card that the parent modifier is applied to
        sourceCardIndex = parentModifier.getCardAffectedIndex()

      # set triggering relationship
      triggeringModifier = @getTriggeringModifier()
      if triggeringModifier instanceof Modifier
        triggeringModifier.onTriggerAppliedModifier(modifier, @getExecutingAction(), @getExecutingResolveAction())

      # find source card index as needed
      if !sourceCardIndex?
        activeCard = @getActiveCard()
        executingAction = @getExecutingAction()
        if activeCard?
          sourceCardIndex = activeCard.getIndex()
        else if executingAction?
          if executingAction instanceof ApplyCardToBoardAction
            applyingAction = executingAction
          else
            applyingAction = executingAction.getMatchingAncestorAction(ApplyCardToBoardAction)
          if applyingAction?
            sourceCardIndex = applyingAction.getCard()?.getIndex()
        else
          sourceCardIndex = card.getIndex()

      # set source card index
      modifier.setSourceCardIndex(sourceCardIndex)

      # set aura modifier id
      if auraModifierId? then modifier.setAuraModifierId(auraModifierId)

      # record the modifier with the card
      card.onAddModifier(modifier)

      # apply the modifier to the card
      modifier.onApplyToCard(card)

  ###*
   * Removes a modifier from a card, attempting to remove via action whenever possible
   * @param {Modifier} modifier modifier to remove
   ###
  removeModifier: (modifier) ->
    if @getIsRunningAsAuthoritative() and modifier instanceof Modifier and modifier.getCard()? and !modifier.getIsRemoved()
      if @_private.actionQueue?
        # modifiers should remove via action when removed during action execution
        removeModifierAction = new RemoveModifierAction(@, modifier)
        @executeAction(removeModifierAction)
      else
        # modifiers can remove instantly when no actions executing
        @p_removeModifier(modifier)

  ###*
   * SDK (package) level method that removes a modifier from a card instantly.
   * NOTE: do not call this method directly, instead use removeModifier
   * @see removeModifier
   ###
  p_removeModifier: (modifier) ->
    if modifier instanceof Modifier and modifier.getCard()? and !modifier.getIsRemoved()
      #Logger.module("SDK").debug "[G:#{@.gameId}]", "GS.p_removeModifier -> #{modifier.getLogName()} from #{modifier.getCard()?.getLogName()}"
      card = modifier.getCard()

      # set triggering relationship
      triggeringModifier = @getTriggeringModifier()
      if triggeringModifier instanceof Modifier
        triggeringModifier.onTriggerRemovedModifier(modifier, @getExecutingAction(), @getExecutingResolveAction())

      # remove the modifier from the card's record
      card.onRemoveModifier(modifier)

      # unapply the modifier
      modifier.onRemoveFromCard()

  moveModifierToCard: (modifier, card) ->
    if @getIsRunningAsAuthoritative() and card instanceof Card and modifier instanceof Modifier
      #Logger.module("SDK").debug("[G:#{@.gameId}]", "GS.moveModifierToCard -> MODIFIER: #{modifier.getType()} with index #{modifier.getIndex()} isRemoved? #{modifier.getIsActive()} CARD FROM: #{modifier.getCard()?.getName()} CARD TO: #{card?.getName()}")
      # copy modifier context object
      modifierContextObject = modifier.createContextObjectForClone()
      parentModifier = modifier.getParentModifier()

      # remove modifier from old card
      @removeModifier(modifier)

      # apply copy of modifier to new card
      @applyModifierContextObject(modifierContextObject, card, parentModifier)

  removeModifierFromCardByType: (type, card) ->
    @removeModifier(card.getModifierByType(type))

  removeModifierFromCardByStackType: (type, card) ->
    @removeModifier(card.getModifierByStackType(type))

  removeModifierFromCardByClass:(cls, card) ->
    @removeModifier(card.getModifierByClass(cls))

  ###*
   * Returns a modifier that matches the index.
   * @param {Number|String} index
   * @returns {Modifier|Null}
   ###
  getModifierByIndex:(index) ->
    if index?
      return @modifiersByIndex[index]

  ###*
   * Returns an array of modifiers that match an array of indices.
   * @param {Array} indices
   * @returns {Array}
   ###
  getModifiersByIndices:(indices) ->
    modifiers = []

    if indices?
      for index in indices
        modifier = @getModifierByIndex(index)
        if modifier?
          modifiers.push(modifier)

    return modifiers

  pushTriggeringModifierOntoStack: (modifier) ->
    @_private.modifierStack.push(modifier)

  popTriggeringModifierFromStack: () ->
    return @_private.modifierStack.pop()

  getTriggeringModifier: () ->
    return @_private.modifierStack[@_private.modifierStack.length - 1]

  ###*
   * Returns all player modifiers.
   * @returns {Array}
   ###
  getPlayerModifiers: () ->
    modifiers = []

    for player in @players
      modifiers = modifiers.concat(player.getPlayerModifiers())

    return modifiers

  # endregion modifiers

  # region serialization

  ###*
   * Serialize object to JSON using SDK rules:
   * - keys starting with "_" will be ignored
   * - properties that are not different from the prototype will be ignored
   * @param {*} source object to serialize to JSON
   ###
  serializeToJSON: (source) ->
    return JSON.stringify(source)
    # return JSON.stringify(UtilsJavascript.deepCopy(
    #   source,
    #   ((key, value) ->
    #     return key[0] != "_"
    #   ),
    #   ((value, dst) ->
    #     if value instanceof Action or value instanceof Modifier
    #       # actions and modifiers need a type to be reconstructed
    #       dst.type = value.type
    #   )
    # ))

  ###*
   * Deserializes game session data provided by an authoritative source such as the server.
   * @param {Object} sessionData game session data as a JSON object
   ###
  deserializeSessionFromFirebase: (sessionData) ->
    #Logger.module("SDK").debug("[G:#{@.gameId}]", "GS.deserializeSessionFromFirebase")
    # emit event that we're deserializing
    # this allows any existing sdk objects to clean themselves up
    @pushEvent({type: EVENTS.before_deserialize, gameSession: @}, {blockActionExecution: true})

    # copy over all the data
    UtilsJavascript.fastExtend(this,sessionData)

    # re-initialize non-persistent properties
    @flushCachedGeneralsByPlayerId()
    @flushAllCachedCards()
    @_private.eventBuffer = []
    @_private.actionsToResolve = []
    @_private.actionsByIndex = {}
    @_private.stepsByIndex = {}
    @players = []
    @players.push(new Player(@, "1", "player1"))
    @players.push(new Player(@, "2", "player2"))
    @cardsByIndex = {}
    @battleMapTemplate = new BattleMapTemplate(@)
    @board = new Board(this, CONFIG.BOARDCOL, CONFIG.BOARDROW)
    @turns = []
    @modifiersByIndex = {}

    if sessionData.players?
      for playerData, i in sessionData.players
        player = @players[i]
        player.deserialize(playerData)

    # deserialize
    if sessionData.battleMapTemplate?
      @battleMapTemplate.deserialize(sessionData.battleMapTemplate)

    if sessionData.modifiersByIndex?
      modifierIndices = Object.keys(sessionData.modifiersByIndex)
      for index in modifierIndices
        modifierData = sessionData.modifiersByIndex[index]
        if modifierData?
          modifier = @deserializeModifierFromFirebase(modifierData)
          if modifier?
            # store modifier in master list
            @modifiersByIndex[index] = modifier

            if !modifier.getIsRemoved()
              # because modifiers are in a flat array, we know sub modifiers will be deserialized
              # instead just add self as sub modifier of parent
              parentModifier = modifier.getParentModifier()
              if parentModifier then parentModifier.addSubModifier(modifier)

    if sessionData.cardsByIndex?
      cardIndices = Object.keys(sessionData.cardsByIndex)
      for index in cardIndices
        cardData = sessionData.cardsByIndex[index]
        if cardData?
          card = @deserializeCardFromFirebase(cardData)
          if card?
            @cardsByIndex[index] = card

    # deserialize all turns
    if sessionData.currentTurn?
      @currentTurn = @deserializeTurnFromFirebase(sessionData.currentTurn)

    if sessionData.turns?
      for turnData in sessionData.turns
        turn = @deserializeTurnFromFirebase(turnData)
        @turns.push(turn)

    # keep track of last step
    currentTurnSteps = @currentTurn.getSteps()
    if currentTurnSteps.length > 0
      @_private.lastStep = currentTurnSteps[currentTurnSteps.length - 1]
    else if @turns.length > 0
      for turn in @turns by -1
        turnSteps = turn.getSteps()
        if turnSteps.length > 0
          @_private.lastStep = turnSteps[turnSteps.length - 1]
          break

    # traverse turns (including current) and add each action to the master list
    # it is crucial that the action graph is read in breadth-first
    # because that is the execution order of the action loop
    turns = [].concat(@turns, [@currentTurn])
    for turn in turns
      for step in turn.getSteps()
        @_private.stepsByIndex[step.getIndex()] = step
        action = step.getAction()
        actionQueue = [action]
        while actionQueue.length > 0
          actionToRecord = actionQueue.shift()
          actionIndex = actionToRecord.getIndex()
          @_private.actionsByIndex[actionIndex] = actionToRecord
          actionQueue = actionQueue.concat(actionToRecord.getSubActions())

    # reconnect cards to the action that played them
    cardIndices = Object.keys(@cardsByIndex)
    for index in cardIndices
      card = @cardsByIndex[index]
      if card?
        # actions cannot ever serialize references to cards for anti-cheat
        # so we have to request the index of the action from the card
        actionIndex = card.getAppliedToBoardByActionIndex()
        if actionIndex? and actionIndex > -1
          action = @getActionByIndex(actionIndex)
          if action?
            action.setCard(card)

    # reconstruct board
    if sessionData.board?
      UtilsJavascript.fastExtend(@board, sessionData.board)

    # for each card on the board
    for cardIndex in @board.getCardIndices()
      card = @getCardByIndex(cardIndex)
      # add the card back to the board
      @board.addCard(card)

      # add the card back to its owner's event receiving cards list
      card.getOwner().addEventReceivingCardOnBoard(card)

    # reattach modifiers to cards
    cardIndices = Object.keys(@cardsByIndex)
    for index in cardIndices
      card = @cardsByIndex[index]
      if card?
        modifierIndices = card.getModifierIndices()
        for index in modifierIndices
          modifier = @getModifierByIndex(index)
          if modifier?
            # record the modifier with the card
            card.onAddModifier(modifier)

            # record card with modifier
            modifier.setCard(card)

            # post deserialize modifier
            modifier.postDeserialize()

    # post deserialize cards once all cards and modifiers are guaranteed
    cardIndices = Object.keys(@cardsByIndex)
    for index in cardIndices
      card = @cardsByIndex[index]
      if card?
        card.postDeserialize()

    # post deserialize players once all cards and modifiers are guaranteed
    for player in @players
      player.postDeserialize()

    @pushEvent({type: EVENTS.deserialize, gameSession: @}, {blockActionExecution: true})

  deserializeCardFromFirebase: (cardData) ->
    if cardData?
      card = @createCardForIdentifier(cardData.id)
      card.deserialize(cardData)

      return card

  deserializeTurnFromFirebase: (turnData) ->
    if turnData?
      turn = new GameTurn(@)
      turn.deserialize(turnData)

      return turn

  deserializeStepFromFirebase: (stepData) ->
    if stepData?
      # Logger.module("SDK").debug("[G:#{@.gameId}]", "GameSession::deserializeStepFromFirebase",stepData)

      step = new Step(@)
      step.deserialize(stepData)
      step.setAction(@deserializeActionFromFirebase(stepData.action))

      return step

  deserializeActionFromFirebase: (actionData) ->
    if actionData?
      action = @createActionForType(actionData.type)
      action.deserialize(actionData)

      return action

  deserializeModifierFromFirebase: (modifierData) ->
    if modifierData?
      modifier = @createModifierForType(modifierData.type)
      modifier.deserialize(modifierData)

      return modifier

  # endregion serialization
