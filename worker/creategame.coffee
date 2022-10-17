## ALL LOGIC FOR CREATING A GAME HERE
## SHOULD BE PLACE WHERE SDK IS USED
SDK     = require '../app/sdk.coffee'
RSX     = require '../app/data/resources.js'
Logger     = require '../app/common/logger.coffee'
_       = require 'underscore'
request   = require 'superagent'
config     = require '../config/config.js'
Promise   = require 'bluebird'
moment     = require 'moment'
GamesModule = require '../server/lib/data_access/games'
{GameManager} = require '../server/redis/'
fs = require 'fs'
{version} = JSON.parse(fs.readFileSync('./version.json'))

env = config.get('env')

createGame = (gameType, player1Data, player2Data, gameServer, callback) ->

  player1DataForGame = player1Data
  player2DataForGame = player2Data

  # make it random who goes first
  # swap player 1/2 data
  if Math.random() >= 0.5
    tmp = player1DataForGame
    player1DataForGame = player2DataForGame
    player2DataForGame = tmp

  # TODO : check for valid IDs / names
  player1Id = player1DataForGame?.userId
  player1Name = player1DataForGame?.name
  player2Id = player2DataForGame?.userId
  player2Name = player2DataForGame?.name

  # if we are trying to create a game where the player is on both sides, or any of the two player IDs is not defined, we have an issue
  if player1Id == player2Id or !player1Id? or !player2Id?

    Logger.module("GAME CREATE").error "ERROR Creating a game for #{player1Id} and #{player2Id}. Invalid data.".red

    error = new Error("Could not create a game because one or both the player IDs are invalid")

    # send the error along to the callback
    return Promise.reject(error).nodeify()

  Logger.module("GAME CREATE").debug "Setting up game for user #{player1Name} and user #{player2Name} on #{gameServer}"

  # try to setup GameSession
  try
    # create GameSession
    newGameSession = SDK.GameSession.create()
    newGameSession.gameType = gameType
    newGameSession.gameFormat = SDK.GameType.getGameFormatForGameType(gameType)
    # modify "casual" games to create holiday game mode
    # if gameType is SDK.GameType.Casual
    #   # setup cards on board
    #   player1DataForGame.battleMapIndexes = [10] # force game to be played on Vanar battlemap
    #   # add spell to game that creates logic for custom game mode
    #   player1DataForGame.startingBoardCardsData ?= []
    #   player1DataForGame.startingBoardCardsData.push({
    #     id: SDK.Cards.Spell.FestiveSpirit
    #     position: {x: 0, y: 0}
    #     })
    newGameSession.version = version
    newGameSession.setIsRunningAsAuthoritative(true)
    SDK.GameSetup.setupNewSession(newGameSession, player1DataForGame, player2DataForGame)
  catch error
    Logger.module("GAME CREATE").error "ERROR: setting up GameSession: #{JSON.stringify(error.message)}".red
    Logger.module("GAME CREATE").error error.stack
    return Promise.reject(error).nodeify()

  createdDate = moment().utc().valueOf()
  newGameSession.createdAt  = createdDate
  newGameSession.gameServer = gameServer

  return GameManager.generateGameId()
  .nodeify(callback)
  .bind {}
  .then (gameId) ->
    @gameId = gameId
    Logger.module("GAME CREATE").debug("Unique game id #{gameId}")
    newGameSession.gameId = gameId
    return GameManager.saveGameSession(gameId, newGameSession.serializeToJSON(newGameSession))
  .then () ->
    Logger.module("GAME CREATE").debug("New game session #{@gameId} saved to Redis.")

    player1General = newGameSession.getGeneralForPlayer1()
    player1SetupData = newGameSession.getPlayer1SetupData()
    player2General = newGameSession.getGeneralForPlayer2()
    player2SetupData = newGameSession.getPlayer2SetupData()

    # setup player data
    gameDataForPlayer1 =
      game_type: player1DataForGame.gameType
      game_id: @gameId
      is_player_1: true,
      opponent_username: player2DataForGame.name
      opponent_id: player2DataForGame.userId
      opponent_faction_id: player2SetupData.factionId
      opponent_general_id: player2General.getId()
      status: SDK.GameStatus.active
      created_at: createdDate
      faction_id: player1SetupData.factionId
      general_id: player1General.getId()
      game_server: gameServer
      game_version: version
      deck_cards: _.map player1DataForGame.deck, (c)-> return c.id
      rift_ticket_id: player1DataForGame.ticketId

    gameDataForPlayer2 =
      game_type: player2DataForGame.gameType
      game_id: @gameId
      is_player_1: false,
      opponent_username: player1DataForGame.name
      opponent_id: player1DataForGame.userId
      opponent_faction_id: player1SetupData.factionId
      opponent_general_id: player1General.getId()
      status: SDK.GameStatus.active
      created_at: createdDate
      faction_id: player2SetupData.factionId
      general_id: player2General.getId()
      game_server: gameServer
      game_version: version
      deck_cards: _.map player2DataForGame.deck, (c)-> return c.id
      rift_ticket_id: player2DataForGame.ticketId

    # Add newly created gameId to each users list of games
    return Promise.all([
      GamesModule.newUserGame(player1DataForGame.userId,@.gameId,gameDataForPlayer1)
      GamesModule.newUserGame(player2DataForGame.userId,@.gameId,gameDataForPlayer2)
      # WARNING: this code below is for testing timeouts only
      # new Promise (resolve)-> setTimeout( (()-> resolve()), 16000)
    ])

  .then () ->
    Logger.module("GAME CREATE").debug("Game session #{@gameId} added to each user's list of games.")
    return @gameId

module.exports = createGame
