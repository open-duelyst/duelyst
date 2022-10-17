moment = require 'moment'
Promise = require 'bluebird'
_ = require 'underscore'
{GameManager} = require '../redis/'
CONFIG = require '../../app/common/config'
Logger = require '../../app/common/logger'
generatePushId = require '../../app/common/generate_push_id'
config = require '../../config/config'
{version} = require '../../version'

# sdk
GameSetup = require '../../app/sdk/gameSetup'
GameType = require '../../app/sdk/gameType'
GameStatus = require '../../app/sdk/gameStatus'
GameSession = require '../../app/sdk/gameSession'
GameFormat = require '../../app/sdk/gameFormat'
Factions = require '../../app/sdk/cards/factionsLookup'
FactionFactory = require '../../app/sdk/cards/factionFactory'
Cards = require '../../app/sdk/cards/cardsLookupComplete'

# ai
UsableDecks = require '../ai/decks/usable_decks'

GamesModule = require './data_access/games'
DuelystFirebase = require './duelyst_firebase_module'
FirebasePromises = require './firebase_promises'
knex = require './data_access/knex'
Errors = require './custom_errors'
Consul = require './consul'

createSinglePlayerGame = (userId,name,gameType,deck,cardBackId,battleMapIndexesToSampleFrom,aiPlayerId,aiUsername,aiGeneralId,aiDeckId,aiDifficulty,aiNumRandomCards,ticketId,gameSetupOptions)->
  if !gameType? then gameType = GameType.SinglePlayer

  playerIsPlayer1 = true

  getSinglePlayerStatusPromise = Promise.resolve({ enabled:false })

  Logger.module("SINGLE PLAYER").debug "deck:", deck
  Logger.module("SINGLE PLAYER").debug "ticketId:", ticketId

  if config.get('consul.enabled')
    getSinglePlayerStatusPromise =
      Consul.kv.get("environments/#{process.env.NODE_ENV}/single-player-status.json")
      .then JSON.parse
  else
    Logger.module("SINGLE PLAYER").debug "No need to check single player stack status since no CONSUL in environment.".cyan
    getSinglePlayerStatusPromise = Promise.resolve({ enabled:true })

  MOMENT_NOW_UTC = moment.utc()

  getSinglePlayerStatusPromise
  .bind {}
  .then (matchmakingStatus) ->
    # matchmakingEnabled is currently a string
    if matchmakingStatus.enabled
      Logger.module("SINGLE PLAYER").debug "SINGLE PLAYER status is active".cyan
      return true
    else
      Logger.module("SINGLE PLAYER").debug "SINGLE PLAYER status is inactive".red
      throw new Errors.SinglePlayerModeDisabledError("Single Player mode is temporarily disabled.")
  .then () ->
    eventValidationPromise = null
    if (gameType != GameType.BossBattle)
      eventValidationPromise = Promise.resolve()
    else
      eventValidationPromise = DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        bossEventsRef = fbRootRef.child("boss-events")
        return FirebasePromises.once(bossEventsRef,'value')
      .then (bossEventsSnapshot)->
        bossEventsData = bossEventsSnapshot.val()

        matchingEventData = null
        for eventId,eventData of bossEventsData
          if eventData.boss_id != aiGeneralId
            continue
          if eventData.event_start > MOMENT_NOW_UTC.valueOf()
            continue
          if eventData.valid_end < MOMENT_NOW_UTC.valueOf()
            continue

          # Reaching here means we have a matching event
          matchingEventData = eventData
          matchingEventId = eventData.event_id
          break

        if not matchingEventData?
          throw new Errors.BossEventNotFound("No active event found for boss.")

    return eventValidationPromise
  .then ()->
    # get ai deck
    if aiDeckId?
      aiDeck = UsableDecks.getUsableDeckForIdentifier(aiGeneralId, aiDeckId)
    else
      aiDeck = UsableDecks.getAutomaticUsableDeck(aiGeneralId, aiDifficulty, aiNumRandomCards)

    # generate players data
    player1DataForGame =
      userId: userId
      name: name
      deck: deck
      cardBackId: cardBackId
      ticketId: ticketId
      battleMapIndexes: battleMapIndexesToSampleFrom

    player2DataForGame =
      userId: aiPlayerId
      name: aiUsername
      deck: aiDeck

    # merge in any custom game setup options
    if gameSetupOptions?
      withoutManaTiles = gameSetupOptions.withoutManaTiles

      # parse player options
      playerOptions = gameSetupOptions.player
      if playerOptions?
        startingOrderPlayer = if playerOptions.startingOrder? then playerOptions.startingOrder else 0
        player1DataForGame = _.extend(player1DataForGame, playerOptions)

      # parse ai options
      aiOptions = gameSetupOptions.ai
      if aiOptions?
        startingOrderAI = if aiOptions.startingOrder? then aiOptions.startingOrder else 0
        player2DataForGame = _.extend(player2DataForGame, aiOptions)

    if startingOrderAI? and startingOrderAI > 0
      # ai has a fixed starting order
      if startingOrderAI == 1
        playerIsPlayer1 = false
        tmp = player1DataForGame
        player1DataForGame = player2DataForGame
        player2DataForGame = tmp
    else if startingOrderPlayer? and startingOrderPlayer > 0
      # player has a fixed starting order
      if startingOrderPlayer == 2
        playerIsPlayer1 = false
        tmp = player1DataForGame
        player1DataForGame = player2DataForGame
        player2DataForGame = tmp
    else
      # make it random who goes first
      if Math.random() >= 0.5
        playerIsPlayer1 = false
        tmp = player1DataForGame
        player1DataForGame = player2DataForGame
        player2DataForGame = tmp

    # create GameSession
    @.newGameSession = GameSession.create()
    @.newGameSession.gameType = gameType
    @.newGameSession.gameFormat = GameFormat.Legacy
    @.newGameSession.version = version
    @.newGameSession.setIsRunningAsAuthoritative(true)
    GameSetup.setupNewSession(@.newGameSession, player1DataForGame, player2DataForGame, withoutManaTiles)

    # set ai properties for later retrieval by ai
    @.newGameSession.setAiPlayerId(aiPlayerId)
    @.newGameSession.setAiDifficulty(aiDifficulty)

    # generate game id
    return GameManager.generateGameId()
  .then (gameId) -> # save game to redis
    @gameId = gameId
    Logger.module("SINGLE-PLAYER").debug("New Game ID: #{gameId}")
    @.newGameSession.gameId = gameId
    return GameManager.saveGameSession(gameId, @.newGameSession.serializeToJSON(@.newGameSession))

  .then () -> # assign the player to a server
    # Consul flow (disabled).
    ###
    if config.get('consul.enabled')
      Consul.getHealthySinglePlayerServers()
      .then (servers) ->
        if servers.length == 0
          return Promise.reject(new Error("No servers available."))
        # Grab random node from available servers
        random_node = _.sample(servers)
        node_name = random_node["Node"]?["Node"]
        return Consul.kv.get("nodes/#{node_name}/dns_name")
        .then (dns_name) ->
          Logger.module("SINGLE PLAYER").debug "Connecting player to #{dns_name}".green
          return dns_name
    ###

    # Return a domain name in staging and production.
    # TODO: Rework this if we scale beyond one SP server.
    if ['production', 'staging'].includes(config.get('env'))
      server = config.get('matchmaking.defaultGameServer')
      Logger.module('SP').log "Assigning user to game server #{server}"
      return Promise.resolve(server)

    # Return null in development (defaults to window.location.hostname).
    Logger.module('SP').log 'Not assigning game server for dev environment'
    return Promise.resolve(null)

  .then (gameServer)->
    createdDate = moment().utc().valueOf()
    @.newGameSession.createdAt  = createdDate
    @.newGameSession.gameServer = gameServer

    if playerIsPlayer1
      myGeneral = @.newGameSession.getGeneralForPlayer1()
      myPlayerSetupData = @.newGameSession.getPlayer1SetupData()
      opponentGeneral = @.newGameSession.getGeneralForPlayer2()
      opponentSetupData = @.newGameSession.getPlayer2SetupData()
    else
      myGeneral = @.newGameSession.getGeneralForPlayer2()
      myPlayerSetupData = @.newGameSession.getPlayer2SetupData()
      opponentGeneral = @.newGameSession.getGeneralForPlayer1()
      opponentSetupData = @.newGameSession.getPlayer1SetupData()

    # set up game data to save
    gameData =
      game_type: gameType
      game_id: @gameId
      is_player_1: playerIsPlayer1,
      opponent_username: aiUsername
      opponent_id: aiPlayerId
      opponent_faction_id: opponentSetupData.factionId
      opponent_general_id: opponentGeneral.getId()
      status: GameStatus.active
      created_at: createdDate
      faction_id: myPlayerSetupData.factionId
      general_id: myGeneral.getId()
      game_server: gameServer
      game_version: version
      deck_cards: _.map deck, (c)-> return c.id
      rift_ticket_id: ticketId || null

    # response data to send back to the REST client
    @.responseData =
      game_type: gameType
      game_id: @gameId
      is_player_1: playerIsPlayer1,
      opponent_username: aiUsername
      opponent_id: aiPlayerId
      opponent_faction_id: opponentSetupData.factionId
      opponent_general_id: opponentGeneral.getId()
      status: GameStatus.active
      created_at: createdDate
      faction_id: myPlayerSetupData.factionId
      general_id: myGeneral.getId()
      game_server: gameServer
      game_version: version
      rift_ticket_id: ticketId || null

    # ...
    return GamesModule.newUserGame(userId,@gameId,gameData)
  .then ()-> # send data back to the player
    return @.responseData

module.exports = createSinglePlayerGame
