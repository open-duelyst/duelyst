###
Game Server Pieces
###
fs = require 'fs'
os = require 'os'
util = require 'util'
_ = require 'underscore'
colors = require 'colors' # used for console message coloring
jwt = require 'jsonwebtoken'
io = require 'socket.io'
ioJwt = require '@thream/socketio-jwt'
Promise = require 'bluebird'
kue = require 'kue'
moment = require 'moment'
request = require 'superagent'

# Our modules
shutdownLib = require './shutdown'
StarterAI = require './ai/starter_ai'
SDK = require '../app/sdk.coffee'
Logger = require '../app/common/logger.coffee'
EVENTS = require '../app/common/event_types'
UtilsGameSession = require '../app/common/utils/utils_game_session.coffee'

# lib Modules
Consul = require './lib/consul'

# Configuration object
config = require '../config/config.js'
env = config.get('env')

# Boots up a basic HTTP server on port 8080
# Responds to /health endpoint with status 200
# Otherwise responds with status 404

Logger     = require '../app/common/logger.coffee'
CONFIG     = require '../app/common/config'
http     = require 'http'
url     = require 'url'
Promise    = require 'bluebird'

# perform DNS health check
dnsHealthCheck = () ->
  if config.isDevelopment()
    return Promise.resolve({healthy: true})
  nodename = "#{config.get('env')}-#{os.hostname().split('.')[0]}"
  return Consul.kv.get("nodes/#{nodename}/dns_name")
  .then (dnsName) ->
    return new Promise (resolve, reject) ->
      request.get("https://#{dnsName}/health")
      .end (err, res) ->
        if err
          return resolve({dnsName: dnsName, healthy: false})
        if res? && res.status == 200
          return resolve({dnsName: dnsName, healthy: true})
        return ({dnsName: dnsName, healthy: false})
  .catch (e) ->
    return {healthy: false}

# create http server and respond to /health requests
server = http.createServer (req, res) ->
  pathname = url.parse(req.url).pathname
  if pathname == '/health'
    #Logger.module("GAME SERVER").debug "HTTP Health Ping"
    res.statusCode = 200
    res.write JSON.stringify({players: playerCount, games: gameCount})
    res.end()
  else
    res.statusCode = 404
    res.end()

# io server setup, binds to http server
io = require('socket.io')().listen(server, {
  cors: {
    origin: "*"
  }
})
io.use(
  ioJwt.authorize(
    secret: config.get('firebase.legacyToken')
    timeout: 15000
  )
)
module.exports = io
port = config.get('sp_port')
server.listen port, () ->
  Logger.module("AI SERVER").log "SP server started on port #{port}"

# redis
{Redis, Jobs, GameManager} = require './redis/'

# server id for this game server
serverId = os.hostname()

# the 'games' hash maps game IDs to References for those games
games = {}

# save some basic stats about this server into redis
playerCount = 0
gameCount = 0

# turn times
MAX_TURN_TIME = (CONFIG.TURN_DURATION + CONFIG.TURN_DURATION_LATENCY_BUFFER) * 1000.0
MAX_TURN_TIME_INACTIVE = (CONFIG.TURN_DURATION_INACTIVE + CONFIG.TURN_DURATION_LATENCY_BUFFER) * 1000.0

savePlayerCount = (playerCount) ->
  Redis.hsetAsync("servers:#{serverId}", "players", playerCount)

saveGameCount = (gameCount) ->
  Redis.hsetAsync("servers:#{serverId}", "games", gameCount)

# health ping on socket namespace /health
healthPing = io
  .of '/health'
  .on 'connection', (socket) ->
    socket.on 'ping', () ->
      Logger.module("GAME SERVER").debug "socket.io Health Ping"
      socket.emit 'pong'

io.sockets.on "connection", (socket) ->
  # Socket is now authenticated, continue to bind other handlers
  Logger.module("IO").log "DECODED TOKEN ID: #{socket.decodedToken.d.id.blue}"
  Logger.module("IO").log "TOKEN ID: #{socket.id.blue}"

  savePlayerCount(++playerCount)

  # Send message to user that connection is succesful
  socket.emit "connected",
    message: "Successfully connected to server"

  # Bind socket event handlers
  socket.on EVENTS.join_game, onGamePlayerJoin
  socket.on EVENTS.spectate_game, onGameSpectatorJoin
  socket.on EVENTS.leave_game, onGameLeave
  socket.on EVENTS.network_game_event, onGameEvent
  socket.on "disconnect", onGameDisconnect

getConnectedSpectatorsDataForGamePlayer = (gameId,playerId)->
  spectators = []
  io.sockets.adapter.rooms.get("spectate-#{gameId}")?.forEach((socketId) ->
    socket = io.sockets.sockets.get(socketId)
    if socket.playerId == playerId
      spectators.push({
        id:socket.spectatorId,
        playerId:socket.playerId,
        username:socket.spectateToken?.u
      })
  )
  return spectators

###
# socket handler for players joining game
# @public
# @param  {Object}  requestData    Plain JS object with socket event data.
###
onGamePlayerJoin = (requestData) ->

  # request parameters
  gameId = requestData.gameId
  playerId = requestData.playerId

  Logger.module("IO").log "[G:#{gameId}]", "join_game -> player:#{requestData.playerId} is joining game:#{requestData.gameId}".cyan

  # you must have a playerId
  if not playerId
    Logger.module("IO").log "[G:#{gameId}]", "join_game -> REFUSING JOIN: A player #{playerId.blue} is not valid".red
    @emit "join_game_response",
      error:"Your player id seems to be blank (has your login expired?), so we can't join you to the game."
    return

  # must have a gameId
  if not gameId
    Logger.module("IO").log "[G:#{gameId}]", "join_game -> REFUSING JOIN: A gameId #{gameId.blue} is not valid".red
    @emit "join_game_response",
      error:"Invalid Game ID."
    return

  # if someone is trying to join a game they don't belong to as a player they are not authenticated as
  if @.decodedToken.d.id != playerId
    Logger.module("IO").log "[G:#{gameId}]", "join_game -> REFUSING JOIN: A player #{@.decodedToken.d.id.blue} is attempting to join a game as #{playerId.blue}".red
    @emit "join_game_response",
      error:"Your player id does not match the one you requested to join a game with. Are you sure you're joining the right game?"
    return

  # if a client is already in another game, leave it
  playerLeaveGameIfNeeded(this)

  # if this client already exists in this game, disconnect duplicate client
  io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
    socket = io.sockets.sockets.get(socketId)
    if socket? and socket.playerId == playerId
      Logger.module("IO").log "[G:#{gameId}]", "join_game -> detected duplicate connection to #{gameId} GameSession for #{playerId.blue}. Disconnecting duplicate...".cyan
      playerLeaveGameIfNeeded(socket, silent=true)
  )

  # initialize a server-side game session and join it
  initGameSession(gameId)
  .bind @
  .spread (gameSession) ->

    #Logger.module("IO").debug "[G:#{gameId}]", "join_game -> players in data: ", gameSession.players

    # player
    player = _.find(gameSession.players, (p) -> return p.playerId == playerId)

    # get the opponent based on the game session data
    opponent = _.find(gameSession.players, (p) -> return p.playerId != playerId)

    Logger.module("IO").log "[G:#{gameId}]", "join_game -> Got #{gameId} GameSession data #{playerId.blue}.".cyan

    if not player # oops looks like this player does not exist in the requested game

      # let the socket know we had an error
      @emit "join_game_response",
        error:"could not join game because your player id could not be found"

      # destroy the game data loaded so far if the opponent can't be defined and no one else is connected
      Logger.module("IO").log "[G:#{gameId}]", "onGameJoin -> DESTROYING local game cache due to join error".red
      destroyGameSessionIfNoConnectionsLeft(gameId)

      # stop any further processing
      return

    else if not opponent? # oops, looks like we can'f find an opponent in the game session?

      Logger.module("IO").log "[G:#{gameId}]", "join_game -> game #{gameId} ERROR: could not find opponent for #{playerId.blue}.".red

      # let the socket know we had an error
      @emit "join_game_response",
        error:"could not join game because the opponent could not be found"

      # destroy the game data loaded so far if the opponent can't be defined and no one else is connected
      Logger.module("IO").log "[G:#{gameId}]", "onGameJoin -> DESTROYING local game cache due to join error".red
      destroyGameSessionIfNoConnectionsLeft(gameId)

      # stop any further processing
      return

    else
      # rollback if it is this player's followup
      # this can happen if a player reconnects without properly disconnecting
      if gameSession.getIsFollowupActive() and gameSession.getCurrentPlayerId() == playerId
        gameSession.executeAction(gameSession.actionRollbackSnapshot())

      # set some parameters for the socket
      @gameId = gameId
      @playerId = playerId

      # join game room
      @join(gameId)

      # update user count for game room
      games[gameId].connectedPlayers.push(playerId)

      Logger.module("IO").log "[G:#{gameId}]", "join_game -> Game #{gameId} connected players so far: #{games[gameId].connectedPlayers.length}."

      # if only one player is in so far, start the disconnection timer
      if games[gameId].connectedPlayers.length == 1
        # start disconnected player timeout for game
        startDisconnectedPlayerTimeout(gameId,opponent.playerId)
      else if games[gameId].connectedPlayers.length == 2
        # clear timeout when we get two players
        clearDisconnectedPlayerTimeout(gameId)

      # prepare and scrub game session data for this player
      # if a followup is active and it isn't this player's followup, send them the rollback snapshot
      if gameSession.getIsFollowupActive() and gameSession.getCurrentPlayerId() != playerId
        gameSessionData = JSON.parse(gameSession.getRollbackSnapshotData())
      else
        gameSessionData = JSON.parse(gameSession.serializeToJSON(gameSession))
      UtilsGameSession.scrubGameSessionData(gameSession, gameSessionData, playerId)

      # respond to client with success and a scrubbed copy of the game session
      @emit "join_game_response",
        message: "successfully joined game"
        gameSessionData: gameSessionData
        connectedPlayers:games[gameId].connectedPlayers
        connectedSpectators: getConnectedSpectatorsDataForGamePlayer(gameId,playerId)

      # broadcast join to any other connected players
      @broadcast.to(gameId).emit("player_joined",playerId)

      # attempt to update ai turn on active game
      if gameSession.isActive()
        ai_updateTurn(gameId)

  .catch (e) ->
    Logger.module("IO").error "[G:#{gameId}]", "join_game -> player:#{playerId} failed to join game. ERROR: #{e.message}".red
    # if we didn't join a game, broadcast a failure
    @emit "join_game_response",
      error:"Could not join game: " + e?.message

###
# socket handler for spectators joining game
# @public
# @param  {Object}  requestData    Plain JS object with socket event data.
###
onGameSpectatorJoin = (requestData) ->

  # request parameters
  # TODO : Sanitize these parameters to prevent crash if gameId = null
  gameId = requestData.gameId
  spectatorId = requestData.spectatorId
  playerId = requestData.playerId
  spectateToken = null

  # verify - synchronous
  try
    spectateToken = jwt.verify(requestData.spectateToken, config.get('firebase.legacyToken'))
  catch error
    Logger.module("IO").error "[G:#{gameId}]", "spectate_game -> ERROR decoding spectate token: #{error?.message}".red

  if not spectateToken or spectateToken.b?.length == 0
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: A specate token #{spectateToken} is not valid".red
    @emit "spectate_game_response",
      error:"Your spectate token is invalid, so we can't join you to the game."
    return

  Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> token contents: ", spectateToken.b
  Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> playerId: ", playerId

  if not _.contains(spectateToken.b,playerId)
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: You do not have permission to specate this game".red
    @emit "spectate_game_response",
      error:"You do not have permission to specate this game."
    return

  # must have a spectatorId
  if not spectatorId
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: A spectator #{spectatorId.blue} is not valid".red
    @emit "spectate_game_response",
      error:"Your login ID is blank (expired?), so we can't join you to the game."
    return

  # must have a playerId
  if not playerId
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: A player #{playerId.blue} is not valid".red
    @emit "spectate_game_response",
      error:"Invalid player ID."
    return

  # must have a gameId
  if not gameId
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: A gameId #{gameId.blue} is not valid".red
    @emit "spectate_game_response",
      error:"Invalid Game ID."
    return

  # if someone is trying to join a game they don't belong to as a player they are not authenticated as
  if @.decodedToken.d.id != spectatorId
    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> REFUSING JOIN: A player #{@.decodedToken.d.id.blue} is attempting to join a game as #{playerId.blue}".red
    @emit "spectate_game_response",
      error:"Your login ID does not match the one you requested to spectate the game with."
    return

  Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> spectator:#{spectatorId} is joining game:#{gameId}".cyan

  # if a client is already in another game, leave it
  spectatorLeaveGameIfNeeded(@)

  if games[gameId]?.connectedSpectators.length >= 10
    # max out at 10 spectators
    @emit "spectate_game_response",
      error:"Maximum number of spectators already watching."
    return

  # initialize a server-side game session and join it
  initSpectatorGameSession(gameId)
  .bind @
  .then (spectatorGameSession) ->

    # for spectators, use the delayed in-memory game session
    gameSession = spectatorGameSession

    Logger.module("IO").log "[G:#{gameId}]", "spectate_game -> Got #{gameId} GameSession data.".cyan
    player = _.find(gameSession.players, (p) -> return p.playerId == playerId)
    opponent = _.find(gameSession.players, (p) -> return p.playerId != playerId)

    if not player

      # let the socket know we had an error
      @emit "spectate_game_response",
        error:"could not join game because the player id you requested could not be found"

      # destroy the game data loaded so far if the opponent can't be defined and no one else is connected
      Logger.module("IO").log "[G:#{gameId}]", "onGameSpectatorJoin -> DESTROYING local game cache due to join error".red
      destroyGameSessionIfNoConnectionsLeft(gameId)

      # stop any further processing
      return

    else

      # set some parameters for the socket
      @gameId = gameId
      @spectatorId = spectatorId
      @spectateToken = spectateToken
      @playerId = playerId

      # join game room
      @join("spectate-#{gameId}")

      # update user count for game room
      games[gameId].connectedSpectators.push(spectatorId)

      # prepare and scrub game session data for this player
      # if a followup is active and it isn't this player's followup, send them the rollback snapshot
      if gameSession.getIsFollowupActive() and gameSession.getCurrentPlayerId() != playerId
        gameSessionData = JSON.parse(gameSession.getRollbackSnapshotData())
      else
        gameSessionData = JSON.parse(gameSession.serializeToJSON(gameSession))
      UtilsGameSession.scrubGameSessionData(gameSession, gameSessionData, playerId, true)
      ###
      # if the spectator does not have the opponent in their buddy list
      if not _.contains(spectateToken.b,opponent.playerId)
        # scrub deck data and opponent hand data by passing in opponent ID
        scrubGameSessionDataForSpectators(gameSession, gameSessionData, opponent.playerId)
      else
        # otherwise just scrub deck data in a way you can see both decks
        # scrubGameSessionDataForSpectators(gameSession, gameSessionData)
        # NOTE: above line is disabled for now since it does some UI jankiness since when a cardId is present the tile layer updates when the spectated opponent starts to select cards
        # NOTE: besides, actions will be scrubbed so this idea of watching both players only sort of works right now
        scrubGameSessionDataForSpectators(gameSession, gameSessionData, opponent.playerId, true)
      ###
      # respond to client with success and a scrubbed copy of the game session
      @emit "spectate_game_response",
        message: "successfully joined game"
        gameSessionData: gameSessionData

      # broadcast to the game room that a spectator has joined
      @broadcast.to(gameId).emit("spectator_joined",{
        id: spectatorId,
        playerId: playerId,
        username: spectateToken.u
      })

  .catch (e) ->
    # if we didn't join a game, broadcast a failure
    @emit "spectate_game_response",
      error:"could not join game: #{e.message}"

###
# socket handler for leaving a game.
# @public
# @param  {Object}  requestData    Plain JS object with socket event data.
###
onGameLeave = (requestData) ->
  if @.spectatorId
    Logger.module("IO").log "[G:#{@.gameId}]", "leave_game -> spectator #{@.spectatorId} leaving #{@.gameId}"
    spectatorLeaveGameIfNeeded(@)
  else
    Logger.module("IO").log "[G:#{@.gameId}]", "leave_game -> player #{@.playerId} leaving #{@.gameId}"
    playerLeaveGameIfNeeded(@)

###*
# This method is called every time a socket handler recieves a game event and is executed within the context of the socket (this == sending socket).
# @public
# @param  {Object}  eventData    Plain JS object with event data that contains one "event".
###
onGameEvent = (eventData) ->

  # if for some reason spectator sockets start broadcasting game events
  if @.spectatorId
    Logger.module("IO").log "[G:#{@.gameId}]", "onGameEvent :: ERROR: spectator sockets can't submit game events. (type: #{eventData.type})".red
    return

  # Logger.module("IO").log "onGameEvent -> #{JSON.stringify(eventData)}".blue

  if not @gameId or not games[@gameId]

    @emit EVENTS.network_game_error,
      code:500
      message:"could not broadcast game event because you are not currently in a game"

    return

  #
  gameSession = games[@gameId].session

  if eventData.type == EVENTS.step

    #Logger.module("IO").log "[G:#{@.gameId}]", "game_step -> #{JSON.stringify(eventData.step)}".green
    #Logger.module("IO").log "[G:#{@.gameId}]", "game_step -> #{eventData.step?.playerId} #{eventData.step?.action?.type}".green

    player = _.find(gameSession.players,(p)-> p.playerId == eventData.step?.playerId)
    player?.setLastActionTakenAt(Date.now())

    try

      step = gameSession.deserializeStepFromFirebase(eventData.step)
      action = step.action
      if action?
        # clear out any implicit actions sent over the network and re-execute this as a fresh explicit action on the server
        # the reason is that we want to re-generate and re-validate all the game logic that happens as a result of this FIRST explicit action in the step
        action.resetForAuthoritativeExecution()

        # execute the action
        gameSession.executeAction(action)

    catch error
      Logger.module("IO").log "[G:#{@.gameId}]", "onGameStep:: error: #{JSON.stringify(error.message)}".red
      Logger.module("IO").log "[G:#{@.gameId}]", "onGameStep:: error stack: #{error.stack}".red

      # delete but don't destroy game
      destroyGameSessionIfNoConnectionsLeft(@gameId,true)

      # send error to client, forcing reconnect on client side
      io.to(@gameId).emit EVENTS.network_game_error, JSON.stringify(error.message)
      return

  else
    # transmit the non-step game events to players
    # step events are emitted automatically after executed on game session
    emitGameEvent(@, @gameId, eventData)

###
# Socket Disconnect Event Handler. Handles rollback if in the middle of followup etc.
# @public
###
onGameDisconnect = () ->
  if @.spectatorId
    # make spectator leave game room
    spectatorLeaveGameIfNeeded(@)

  else
    try
      io.sockets.adapter.rooms.get(@.gameId)?.forEach((socketId) ->
        socket = io.sockets.sockets.get(socketId)
        if socket.playerId == @.playerId
          Logger.module("IO").log "onGameDisconnect:: looks like the player #{@.playerId} we are trying to disconnect is still in the game #{@.gameId} room. ABORTING".red
          return
      )

      for clientId, socket of io.sockets.sockets
        if socket.playerId == @.playerId and not socket.spectatorId
          Logger.module("IO").log "onGameDisconnect:: looks like the player #{@.playerId} that allegedly disconnected is still alive and well.".red
          return

    catch error
      Logger.module("IO").log "onGameDisconnect:: Error #{error?.message}.".red

    # if we are in a buffering state
    # and the disconnecting player is in the middle of a followup
    gs = games[@gameId]?.session
    if gs? and gs.getIsBufferingEvents() and gs.getCurrentPlayerId() == @playerId
      # execute a rollback to reset server state
      # but do not send this action to the still connected player
      # because they do not care about rollbacks for the other player
      rollBackAction = gs.actionRollbackSnapshot()
      gs.executeAction(rollBackAction)

    savePlayerCount(--playerCount)
    Logger.module("IO").log "[G:#{@.gameId}]", "disconnect -> #{@.playerId}".red

    # if a client is already in another game, leave it
    playerLeaveGameIfNeeded(@)

###*
 * Leaves a game for a player socket if the socket is connected to a game
 * @public
 * @param  {Socket} socket The socket which wants to leave a game.
 * @param {Boolean} [silent=false] whether to disconnect silently, as in the case of duplicate connections for same player
 ###
playerLeaveGameIfNeeded = (socket, silent=false) ->
  if socket?
    gameId = socket.gameId
    playerId = socket.playerId

    # if a player is in a game
    if gameId? and playerId?
      Logger.module("...").log "[G:#{gameId}]", "playerLeaveGame -> #{playerId} has left game #{gameId}".red

      if !silent
        # broadcast that player left
        socket.broadcast.to(gameId).emit("player_left",playerId)

      # leave that game room
      socket.leave(gameId)

      # update user count for game room
      game = games[gameId]
      if game?
        index = game.connectedPlayers.indexOf(playerId)
        game.connectedPlayers.splice(index,1)

        if !silent
          # start disconnected player timeout for game
          startDisconnectedPlayerTimeout(gameId,playerId)

          # destroy game if no one is connected anymore
          destroyGameSessionIfNoConnectionsLeft(gameId,true)

      # finally clear the existing gameId
      socket.gameId = null

###
# This function leaves a game for a spectator socket if the socket is connected to a game
# @public
# @param  {Socket}  socket    The socket which wants to leave a game.
###
spectatorLeaveGameIfNeeded = (socket) ->
  # if a client is already in another game
  if socket.gameId

    Logger.module("...").debug "[G:#{socket.gameId}]", "spectatorLeaveGameIfNeeded -> #{socket.spectatorId} leaving game #{socket.gameId}."

    # broadcast that you left
    socket.broadcast.to(socket.gameId).emit("spectator_left",{
      id:socket.spectatorId,
      playerId:socket.playerId,
      username:socket.spectateToken?.u
    })

    # leave specator game room
    socket.leave("spectate-#{socket.gameId}")

    Logger.module("...").debug "[G:#{socket.gameId}]", "spectatorLeaveGameIfNeeded -> #{socket.spectatorId} left room for game #{socket.gameId}."

    # update spectator count for game room
    if games[socket.gameId]
      games[socket.gameId].connectedSpectators = _.without(games[socket.gameId].connectedSpectators,socket.spectatorId)

      Logger.module("...").debug "[G:#{socket.gameId}]", "spectatorLeaveGameIfNeeded -> #{socket.spectatorId} removed from list of spectators #{socket.gameId}."

      # if no spectators left, stop the delayed game interval and destroy spectator delayed game session
      tearDownSpectateSystemsIfNoSpectatorsLeft(socket.gameId)

      # destroy game if no one is connected anymore
      destroyGameSessionIfNoConnectionsLeft(socket.gameId,true)

    remainingSpectators = games[socket.gameId]?.connectedSpectators?.length || 0
    Logger.module("...").log "[G:#{socket.gameId}]", "spectatorLeaveGameIfNeeded -> #{socket.spectatorId} has left game #{socket.gameId}. remaining spectators #{remainingSpectators}"

    # finally clear the existing gameId
    socket.gameId = null

###
# This function destroys in-memory game session of there is no one left connected
# @public
# @param  {String}  gameId    The ID of the game to destroy.
# @param  {Boolean}  persist    Do we need to save/archive this game?
###
destroyGameSessionIfNoConnectionsLeft = (gameId,persist=false)->

  if games[gameId].connectedPlayers.length == 1 and games[gameId].connectedSpectators.length == 0
    clearDisconnectedPlayerTimeout(gameId)
    stopTurnTimer(gameId)
    tearDownSpectateSystemsIfNoSpectatorsLeft(gameId)
    Logger.module("...").log "[G:#{gameId}]", "destroyGameSessionIfNoConnectionsLeft() -> no players left DESTROYING local game cache".red
    unsubscribeFromGameSessionEvents(gameId)
    ai_terminate(gameId)

    # TEMP: a way to upload unfinished game data to AWS S3 Archive. For example: errored out games.
    if persist and games?[gameId]?.session?.status != SDK.GameStatus.over
      data = games[gameId].session.serializeToJSON(games[gameId].session)
      mouseAndUIEventsData = JSON.stringify(games[gameId].mouseAndUIEvents)
      Promise.all([
        GameManager.saveGameSession(gameId,data),
        GameManager.saveGameMouseUIData(gameId,mouseAndUIEventsData),
      ])
      .then (results) ->
        Logger.module("...").log "[G:#{gameId}]", "destroyGameSessionIfNoConnectionsLeft -> unfinished Game Archived to S3: #{results[1]}".green
      .catch (error)->
        Logger.module("...").log "[G:#{gameId}]", "destroyGameSessionIfNoConnectionsLeft -> ERROR: failed to archive unfinished game to S3 due to error #{error.message}".red

    delete games[gameId]
    saveGameCount(--gameCount)

  else

    Logger.module("...").debug "[G:#{gameId}]", "destroyGameSessionIfNoConnectionsLeft() -> players left: #{games[gameId].connectedPlayers.length} spectators left: #{games[gameId].connectedSpectators.length}"

###
# This function stops all spectate systems if 0 spectators left.
# @public
# @param  {String}  gameId    The ID of the game to tear down spectate systems.
###
tearDownSpectateSystemsIfNoSpectatorsLeft = (gameId)->
  # if no spectators left, stop the delayed game interval and destroy spectator delayed game session
  if games[gameId]?.connectedSpectators.length == 0
    Logger.module("IO").debug "[G:#{gameId}]", "tearDownSpectateSystemsIfNoSpectatorsLeft() -> no spectators left, stopping spectate systems"
    stopSpectatorDelayedGameInterval(gameId)
    games[gameId].spectatorDelayedGameSession = null
    games[gameId].spectateIsRunning = false
    games[gameId].spectatorOpponentEventDataBuffer.length = 0
    games[gameId].spectatorGameEventBuffer.length = 0

###
# Clears timeout for disconnected players
# @public
# @param  {String}  gameId      The ID of the game to clear disconnected timeout for.
###
clearDisconnectedPlayerTimeout = (gameId) ->
  Logger.module("IO").log "[G:#{gameId}]", "clearDisconnectedPlayerTimeout:: for game: #{gameId}".yellow
  clearTimeout(games[gameId]?.disconnectedPlayerTimeout)
  games[gameId]?.disconnectedPlayerTimeout = null

###
# Starts timeout for disconnected players
# @public
# @param  {String}  gameId      The ID of the game.
# @param  {String}  playerId    The player ID for who to start the timeout.
###
startDisconnectedPlayerTimeout = (gameId,playerId) ->
  if games[gameId]?.disconnectedPlayerTimeout?
    clearDisconnectedPlayerTimeout(gameId)
  Logger.module("IO").log "[G:#{gameId}]", "startDisconnectedPlayerTimeout:: for #{playerId} in game: #{gameId}".yellow

  games[gameId]?.disconnectedPlayerTimeout = setTimeout(()->
    onDisconnectedPlayerTimeout(gameId,playerId)
  ,60000)

###
# Resigns game for disconnected player.
# @public
# @param  {String}  gameId      The ID of the game.
# @param  {String}  playerId    The player ID who is resigning.
###
onDisconnectedPlayerTimeout = (gameId,playerId) ->
  Logger.module("IO").log "[G:#{gameId}]", "onDisconnectedPlayerTimeout:: #{playerId} for game: #{gameId}"

  io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
    socket = io.sockets.sockets.get(socketId)
    if socket.playerId == playerId
      Logger.module("IO").log "[G:#{gameId}]", "onDisconnectedPlayerTimeout:: looks like the player #{playerId} we are trying to dis-connect is still in the game #{gameId} room. ABORTING".red
      return
  )

  for clientId, socket of io.sockets.sockets
    if socket.playerId == playerId and not socket.spectatorId
      Logger.module("IO").log "[G:#{gameId}]", "onDisconnectedPlayerTimeout:: looks like the player #{playerId} we are trying to disconnect is still connected but not in the game #{gameId} room.".red
      return


  # grab the relevant game session
  gs = games[gameId]?.session

  # looks like we timed out for a game that's since ended
  if !gs or gs?.status == SDK.GameStatus.over

    Logger.module("IO").log "[G:#{gameId}]", "onDisconnectedPlayerTimeout:: #{playerId} timed out for FINISHED or NULL game: #{gameId}".yellow
    return

  else

    Logger.module("IO").log "[G:#{gameId}]", "onDisconnectedPlayerTimeout:: #{playerId} auto-resigning game: #{gameId}".yellow

    # resign the player
    player = gs.getPlayerById(playerId)
    resignAction = player.actionResign()
    gs.executeAction(resignAction)

###*
# Start/Restart server side game timer for a game
# @public
# @param  {Object}    gameId      The game ID.
###
restartTurnTimer = (gameId) ->
  stopTurnTimer(gameId)

  game = games[gameId]
  if game.session?
    game.turnTimerStartedAt = game.turnTimeTickAt = Date.now()
    if game.session.isBossBattle()
      # boss battles turns have infinite time
      # so we'll just tick once and wait
      onGameTimeTick(gameId)
    else
      # set turn timer on a 1 second interval
      game.turnTimer = setInterval((()-> onGameTimeTick(gameId)),1000)

###*
# Stop server side game timer for a game
# @public
# @param  {Object}    gameId      The game ID.
###
stopTurnTimer = (gameId) ->
  game = games[gameId]
  if game? and game.turnTimer?
    clearInterval(game.turnTimer)
    game.turnTimer = null

###*
# Server side game timer. After 90 seconds it will end the turn for the current player.
# @public
# @param  {Object}    gameId      The game for which to iterate the time.
###
onGameTimeTick = (gameId) ->
  game = games[gameId]
  gameSession = game?.session

  if gameSession?
    # allowed turn time is 90 seconds + 3 second buffer that clients don't see
    allowed_turn_time = MAX_TURN_TIME

    # grab the current player
    player = gameSession.getCurrentPlayer()

    # if we're past the 2nd turn, we can start checking backwards to see how long the PREVIOUS turn for this player took
    if player and gameSession.getTurns().length > 2

      # find the current player's previous turn
      allTurns = gameSession.getTurns()
      playersPreviousTurn = null

      for i in [allTurns.length-1..0] by -1
        if allTurns[i].playerId == player.playerId
          playersPreviousTurn = allTurns[i] # gameSession.getTurns()[gameSession.getTurns().length - 3]
          break

      #Logger.module("IO").log "[G:#{gameId}]", "onGameTimeTick:: last action at #{player.getLastActionTakenAt()} / last turn delta #{playersPreviousTurn?.createdAt - player.getLastActionTakenAt()}".red

      # if this player's previous action was on a turn older than the last one
      if playersPreviousTurn && (playersPreviousTurn.createdAt - player.getLastActionTakenAt() > 0)
        # you're only allowed 15 seconds + 3 second buffer that clients don't see
        allowed_turn_time = MAX_TURN_TIME_INACTIVE

    lastTurnTimeTickAt = game.turnTimeTickAt
    game.turnTimeTickAt = Date.now()
    delta_turn_time_tick = game.turnTimeTickAt - lastTurnTimeTickAt
    delta_since_timer_began = game.turnTimeTickAt - game.turnTimerStartedAt
    game.turnTimeRemaining = Math.max(0.0, allowed_turn_time - delta_since_timer_began + game.turnTimeBonus)
    game.turnTimeBonus = Math.max(0.0, game.turnTimeBonus - delta_turn_time_tick)
    #Logger.module("IO").log "[G:#{gameId}]", "onGameTimeTick:: delta #{delta_turn_time_tick/1000}, #{game.turnTimeRemaining/1000} time remaining, #{game.turnTimeBonus/1000} bonus remaining"

    turnTimeRemainingInSeconds = Math.ceil(game.turnTimeRemaining/1000)
    gameSession.setTurnTimeRemaining(turnTimeRemainingInSeconds)

    if game.turnTimeRemaining <= 0
      # turn time has expired
      stopTurnTimer(gameId)

      if gameSession.status == SDK.GameStatus.new
        # force draw starting hand with current cards
        for player in gameSession.players
          if not player.getHasStartingHand()
            Logger.module("IO").log "[G:#{gameId}]", "onGameTimeTick:: mulligan timer up, submitting player #{player.playerId.blue} mulligan".red
            drawStartingHandAction = player.actionDrawStartingHand([])
            gameSession.executeAction(drawStartingHandAction)
      else if gameSession.status == SDK.GameStatus.active
        # force end turn
        Logger.module("IO").log "[G:#{gameId}]", "onGameTimeTick:: turn timer up, submitting player #{gameSession.getCurrentPlayerId().blue} turn".red
        endTurnAction = gameSession.actionEndTurn()
        gameSession.executeAction(endTurnAction)
    else
      # if the turn timer has not expired, just send the time tick over to all clients
      totalStepCount = gameSession.getStepCount() - games[gameId].opponentEventDataBuffer.length
      emitGameEvent(null,gameId,{type:EVENTS.turn_time, time: turnTimeRemainingInSeconds, timestamp: Date.now(), stepCount: totalStepCount})

###*
# ...
# @public
# @param  {Object}    gameId      The game ID.
###
restartSpectatorDelayedGameInterval = (gameId) ->
  stopSpectatorDelayedGameInterval(gameId)
  Logger.module("IO").debug "[G:#{gameId}]", "restartSpectatorDelayedGameInterval"
  if games[gameId].spectateIsDelayed
    games[gameId].spectatorDelayTimer = setInterval((()-> onSpectatorDelayedGameTick(gameId)), 500)

###*
# ...
# @public
# @param  {Object}    gameId      The game ID.
###
stopSpectatorDelayedGameInterval = (gameId) ->
  Logger.module("IO").debug "[G:#{gameId}]", "stopSpectatorDelayedGameInterval"
  clearInterval(games[gameId].spectatorDelayTimer)

###*
# Ticks the spectator delayed game and usually flushes the buffer by calling `flushSpectatorNetworkEventBuffer`.
# @public
# @param  {Object}    gameId      The game for which to iterate the time.
###
onSpectatorDelayedGameTick = (gameId) ->

  if not games[gameId]
    Logger.module("Game").debug "onSpectatorDelayedGameTick() -> game [G:#{gameId}] seems to be destroyed. Stopping ticks."
    stopSpectatorDelayedGameInterval(gameId)
    return

  _logSpectatorTickInfo(gameId)

  # flush anything in the spectator buffer
  flushSpectatorNetworkEventBuffer(gameId)

###*
# Runs actions delayed in the spectator buffer.
# @public
# @param  {Object}    gameId      The game for which to iterate the time.
###
flushSpectatorNetworkEventBuffer = (gameId) ->

  # if there is anything in the buffer
  if games[gameId].spectatorGameEventBuffer.length > 0

    # Logger.module("IO").debug "[G:#{gameId}]", "flushSpectatorNetworkEventBuffer()"

    # remove all the NULLED out actions
    games[gameId].spectatorGameEventBuffer = _.compact(games[gameId].spectatorGameEventBuffer)

    # loop through the actions in order
    for eventData,i in games[gameId].spectatorGameEventBuffer
      timestamp = eventData.timestamp || eventData.step?.timestamp
      # if we are not delaying events or if the event time exceeds the delay show it to spectators
      if not games[gameId].spectateIsDelayed || timestamp and moment().utc().valueOf() - timestamp > games[gameId].spectateDelay
        # null out the event that is about to be broadcast so it can be compacted later
        games[gameId].spectatorGameEventBuffer[i] = null
        if (eventData.step)
          Logger.module("IO").debug "[G:#{gameId}]", "flushSpectatorNetworkEventBuffer() -> broadcasting spectator step #{eventData.type} - #{eventData.step?.action?.type}"

          if games[gameId].spectateIsDelayed
            step = games[gameId].spectatorDelayedGameSession.deserializeStepFromFirebase(eventData.step)
            games[gameId].spectatorDelayedGameSession.executeAuthoritativeStep(step)

          # send events over to spectators of current player
          io.sockets.adapter.rooms.get("spectate-#{gameId}")?.forEach((socketId) ->
            Logger.module("IO").debug "[G:#{gameId}]", "flushSpectatorNetworkEventBuffer() -> transmitting step #{eventData.step?.index?.toString().yellow} with action #{eventData.step.action?.name} to player's spectators"
            socket = io.sockets.sockets.get(socketId)
            if socket? and socket.playerId == eventData.step.playerId
              # scrub the action data. this should not be skipped since some actions include entire deck that needs to be scrubbed because we don't want spectators deck sniping
              eventDataCopy = JSON.parse(JSON.stringify(eventData))
              UtilsGameSession.scrubSensitiveActionData(games[gameId].session, eventDataCopy.step.action, socket.playerId, true)
              socket.emit EVENTS.network_game_event, eventDataCopy
          )

          # skip processing anything for the opponent if this is a RollbackToSnapshotAction since only the sender cares about that one
          if eventData.step.action.type == SDK.RollbackToSnapshotAction.type
            return

          # start buffering events until a followup is complete for the opponent since players can cancel out of a followup
          games[gameId].spectatorOpponentEventDataBuffer.push(eventData)

          # if we are delayed then check the delayed game session for if we are buffering, otherwise use the primary
          isSpectatorGameSessionBufferingFollowups = (games[gameId].spectateIsDelayed and games[gameId].spectatorDelayedGameSession?.getIsBufferingEvents()) || games[gameId].session.getIsBufferingEvents()

          Logger.module("IO").debug "[G:#{gameId}]", "flushSpectatorNetworkEventBuffer() -> opponentEventDataBuffer at #{games[gameId].spectatorOpponentEventDataBuffer.length} ... buffering: #{isSpectatorGameSessionBufferingFollowups}"

          # if we have anything in the buffer and we are currently not buffering, flush the buffer over to your opponent's spectators
          if games[gameId].spectatorOpponentEventDataBuffer.length > 0 and !isSpectatorGameSessionBufferingFollowups
            # copy buffer and reset
            opponentEventDataBuffer = games[gameId].spectatorOpponentEventDataBuffer.slice(0)
            games[gameId].spectatorOpponentEventDataBuffer.length = 0

            # broadcast whatever's in the buffer to the opponent
            _.each(opponentEventDataBuffer, (eventData) ->
              Logger.module("IO").debug "[G:#{gameId}]", "flushSpectatorNetworkEventBuffer() -> transmitting step #{eventData.step?.index?.toString().yellow} with action #{eventData.step.action?.name} to opponent's spectators"
              io.sockets.adapter.rooms.get("spectate-#{gameId}")?.forEach((socketId) ->
                socket = io.sockets.sockets.get(socketId)
                if socket? and socket.playerId != eventData.step.playerId
                  eventDataCopy = JSON.parse(JSON.stringify(eventData))
                  # always scrub steps for sensitive data from opponent's spectator perspective
                  UtilsGameSession.scrubSensitiveActionData(games[gameId].session, eventDataCopy.step.action, socket.playerId, true)
                  socket.emit EVENTS.network_game_event, eventDataCopy
              )
            )
        else
          io.to("spectate-#{gameId}").emit EVENTS.network_game_event, eventData

_logSpectatorTickInfo = _.debounce((gameId)->
  Logger.module("Game").debug "onSpectatorDelayedGameTick() ... #{games[gameId]?.spectatorGameEventBuffer?.length} buffered"
  if games[gameId]?.spectatorGameEventBuffer
    for eventData,i in games[gameId]?.spectatorGameEventBuffer
      Logger.module("Game").debug "onSpectatorDelayedGameTick() eventData: ",eventData
, 1000)

###*
# Emit/Broadcast game event to appropriate destination.
# @public
# @param  {Socket}    event      Originating socket.
# @param  {String}    gameId      The game id for which to broadcast.
# @param  {Object}    eventData    Data to broadcast.
###
emitGameEvent = (fromSocket,gameId,eventData)->
  if games[gameId]?
    if eventData.type == EVENTS.step
      Logger.module("IO").log "[G:#{gameId}]", "emitGameEvent -> step #{eventData.step?.index?.toString().yellow} with timestamp #{eventData.step?.timestamp} and action #{eventData.step?.action?.type}"
      # only broadcast valid steps
      if eventData.step? and eventData.step.timestamp? and eventData.step.action?
        # send the step to the owner
        io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
          socket = io.sockets.sockets.get(socketId)
          if socket? and socket.playerId == eventData.step.playerId
            eventDataCopy = JSON.parse(JSON.stringify(eventData))
            # always scrub steps for sensitive data from player perspective
            UtilsGameSession.scrubSensitiveActionData(games[gameId].session, eventDataCopy.step.action, socket.playerId)
            Logger.module("IO").log "[G:#{gameId}]", "emitGameEvent -> transmitting step #{eventData.step?.index?.toString().yellow} with action #{eventData.step.action?.type} to origin"
            socket.emit EVENTS.network_game_event, eventDataCopy
            # NOTE: don't BREAK here because there is a potential case that during reconnection 3 sockets are connected:
            # 2 for this current reconnecting player and 1 for the opponent
            # breaking here would essentially result in only the DEAD socket in process of disconnecting receiving the event
            # break
        )

        # buffer actions for the opponent other than a rollback action since that should clear the buffer during followups and there's no need to be sent to the opponent
        # essentially: skip processing anything for the opponent if this is a RollbackToSnapshotAction since only the sender cares about that one
        if eventData.step.action.type != SDK.RollbackToSnapshotAction.type

          # start buffering events until a followup is complete for the opponent since players can cancel out of a followup
          games[gameId].opponentEventDataBuffer.push(eventData)

          # if we have anything in the buffer and we are currently not buffering, flush the buffer over to your opponent
          if games[gameId].opponentEventDataBuffer.length > 0 and !games[gameId].session.getIsBufferingEvents()
            # copy buffer and reset
            opponentEventDataBuffer = games[gameId].opponentEventDataBuffer.slice(0)
            games[gameId].opponentEventDataBuffer.length = 0

            # broadcast whatever's in the buffer to the opponent
            _.each(opponentEventDataBuffer, (eventData) ->
              io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
                socket = io.sockets.sockets.get(socketId)
                if socket? and socket.playerId != eventData.step.playerId
                  eventDataCopy = JSON.parse(JSON.stringify(eventData))
                  # always scrub steps for sensitive data from player perspective
                  UtilsGameSession.scrubSensitiveActionData(games[gameId].session, eventDataCopy.step.action, socket.playerId)
                  Logger.module("IO").log "[G:#{gameId}]", "emitGameEvent -> transmitting step #{eventData.step?.index?.toString().yellow} with action #{eventData.step.action?.type} to opponent"
                  socket.emit EVENTS.network_game_event, eventDataCopy
              )
            )
    else if eventData.type == EVENTS.invalid_action
      # send the invalid action notification to the owner
      io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
        socket = io.sockets.sockets.get(socketId)
        if socket? and socket.playerId == eventData.playerId
          eventDataCopy = JSON.parse(JSON.stringify(eventData))
          socket.emit EVENTS.network_game_event, eventDataCopy
          # NOTE: don't BREAK here because there is a potential case that during reconnection 3 sockets are connected:
          # 2 for this current reconnecting player and 1 for the opponent
          # breaking here would essentially result in only the DEAD socket in process of disconnecting receiving the event
      )
    else
      if eventData.type == EVENTS.network_game_hover or eventData.type == EVENTS.network_game_select or eventData.type == EVENTS.network_game_mouse_clear or eventData.type == EVENTS.show_emote
        # save the player id of this event
        eventData.playerId ?= fromSocket?.playerId
        eventData.timestamp = moment().utc().valueOf()

        # mouse events, emotes, etc should be saved and persisted to S3 for replays
        games[gameId].mouseAndUIEvents ?= []
        games[gameId].mouseAndUIEvents.push(eventData)

      if fromSocket?
        # send it along to other connected sockets in the game room
        fromSocket.broadcast.to(gameId).emit EVENTS.network_game_event, eventData
      else
        # send to all sockets connected to the game room
        io.to(gameId).emit EVENTS.network_game_event, eventData

    # push a deep clone of the event data to the spectator buffer
    if games[gameId]?.spectateIsRunning
      spectatorEventDataCopy = JSON.parse(JSON.stringify(eventData))
      games[gameId].spectatorGameEventBuffer.push(spectatorEventDataCopy)

      # if we're not running a timed delay, just flush everything now
      if not games[gameId]?.spectateIsDelayed
        flushSpectatorNetworkEventBuffer(gameId)

###
# start a game session if one doesn't exist and call a completion handler when done
# @public
# @param  {Object}    gameId      The game ID to load.
# @param  {Function}    onComplete    Callback when done.
###
initGameSession = (gameId,onComplete) ->

  if games[gameId]?.loadingPromise
    return games[gameId].loadingPromise

  # setup local cache reference if none already there
  if not games[gameId]
    games[gameId] =
      opponentEventDataBuffer:[]
      connectedPlayers:[]
      session:null
      connectedSpectators:[]
      spectateIsRunning:false
      spectateIsDelayed:false
      spectateDelay:30000
      spectatorGameEventBuffer:[]
      spectatorOpponentEventDataBuffer:[]
      spectatorDelayedGameSession:null
      turnTimerStartedAt: 0
      turnTimeTickAt: 0
      turnTimeRemaining: 0
      turnTimeBonus: 0

  # return game session from redis
  games[gameId].loadingPromise = Promise.all([
    GameManager.loadGameSession(gameId)
    GameManager.loadGameMouseUIData(gameId)
  ])
  .spread (gameData,mouseData)->
    return [
      JSON.parse(gameData)
      JSON.parse(mouseData)
    ]
  .spread (gameDataIn,mouseData) ->
    Logger.module("IO").log "[G:#{gameId}]", "initGameSession -> loaded game data for game:#{gameId}"

    # deserialize game session
    gameSession = SDK.GameSession.create()
    gameSession.setIsRunningAsAuthoritative(true)
    gameSession.deserializeSessionFromFirebase(gameDataIn)

    if gameSession.isOver()
      throw new Error("Game is already over!")

    # store session
    games[gameId].session = gameSession

    # store mouse and ui event data
    games[gameId].mouseAndUIEvents = mouseData

    saveGameCount(++gameCount)

    # setup AI
    ai_setup(gameId)

     # in case the server restarted or loading data for first time, set the last action at timestamp for both players to now
     # this timestamp is used to shorten turn timer if player has not made any moves for a long time
    _.each(gameSession.players,(player)->
      player.setLastActionTakenAt(Date.now())
    )

    # this is ugly but a simple way to subscribe to turn change events to save the game session
    subscribeToGameSessionEvents(gameId)

    # start the turn timer
    restartTurnTimer(gameId)

    return Promise.resolve([
      games[gameId].session
    ])

  .catch (error) ->

    Logger.module("IO").log "[G:#{gameId}]", "initGameSession:: error: #{JSON.stringify(error.message)}".red
    Logger.module("IO").log "[G:#{gameId}]", "initGameSession:: error stack: #{error.stack}".red

    throw error

###
# start a spectator game session if one doesn't exist and call a completion handler when done
# @public
# @param  {Object}    gameId      The game ID to load.
# @param  {Function}    onComplete    Callback when done.
###
initSpectatorGameSession = (gameId)->
  if not games[gameId]
    return Promise.reject(new Error("This game is no longer in progress"))

  return Promise.resolve()
  .then ()->

    # if we're not already running spectate systems
    if not games[gameId].spectateIsRunning
      # mark that we are running spectate systems
      games[gameId].spectateIsRunning = true
      # if we're in the middle of a followup and we have some buffered events, we need to copy them over to the spectate buffer
      if games[gameId].session.getIsBufferingEvents() and games[gameId].opponentEventDataBuffer.length > 0
        games[gameId].spectatorOpponentEventDataBuffer.length = 0
        for eventData in games[gameId].opponentEventDataBuffer
          eventDataCopy = JSON.parse(JSON.stringify(eventData))
          games[gameId].spectatorOpponentEventDataBuffer.push(eventDataCopy)

    if games[gameId].spectateIsDelayed and not games[gameId].spectatorDelayedGameSession
      Logger.module("...").log "[G:#{gameId}]", "initSpectatorDelayedGameSession() -> creating delayed game session"

      # create
      delayedGameDataIn = games[gameId].session.serializeToJSON(games[gameId].session)
      delayedGameSession = SDK.GameSession.create()
      delayedGameSession.setIsRunningAsAuthoritative(false)
      delayedGameSession.deserializeSessionFromFirebase(JSON.parse(delayedGameDataIn))
      delayedGameSession.gameId = "SPECTATE:#{delayedGameSession.gameId}"
      games[gameId].spectatorDelayedGameSession = delayedGameSession
      # start timer to execute delayed / buffered spectator game events
      restartSpectatorDelayedGameInterval(gameId)

      return Promise.resolve(games[gameId].spectatorDelayedGameSession)

    else

      return Promise.resolve(games[gameId].session)

###*
 * Handler for before a game session rolls back to a snapshot.
 ###
onBeforeRollbackToSnapshot = (event) ->
  # clear the buffer just before rolling back
  gameSession = event.gameSession
  gameId = gameSession.gameId
  game = games[gameId]
  if game?
    game.opponentEventDataBuffer.length = 0
    game.spectatorOpponentEventDataBuffer.length = 0

###*
 * Handler for a game session step.
 ###
onStep = (event) ->
  gameSession = event.gameSession
  gameId = gameSession.gameId
  game = games[gameId]
  if game?
    step = event.step
    if step? and step.timestamp? and step.action?
      # send out step events
      stepEventData = {type: EVENTS.step, step: JSON.parse(game.session.serializeToJSON(step))}
      emitGameEvent(null, gameId, stepEventData)

      # special action cases
      action = step.action
      if action instanceof SDK.EndTurnAction
        # save game on end turn
        # delay so that we don't block sending the step back to the players
        _.delay((()->
          if games[gameId]? and games[gameId].session?
            GameManager.saveGameSession(gameId, games[gameId].session.serializeToJSON(games[gameId].session))
        ), 500)
      else if action instanceof SDK.StartTurnAction
        # restart the turn timer whenever a turn starts
        restartTurnTimer(gameId)
      else if action instanceof SDK.DrawStartingHandAction
        # restart turn timer if both players have a starting hand and this step is for a DrawStartingHandAction
        bothPlayersHaveStartingHand = _.reduce(game.session.players,((memo,player)-> memo && player.getHasStartingHand()),true)
        if bothPlayersHaveStartingHand
          restartTurnTimer(gameId)

      if action.getIsAutomatic() and !game.session.getIsFollowupActive()
        # add bonus to turn time for every automatic step
        # unless followup is active, to prevent rollbacks for infinite turn time
        # bonus as a separate parameter accounts for cases such as:
        # - battle pet automatic actions eating up your own time
        # - queuing up many actions and ending turn quickly to eat into opponent's time
        game.turnTimeBonus += 2000

    # when game is over and we have the final step
    # we cannot archive game until final step event
    # because otherwise step won't be finished/signed correctly
    # so we must do this on step event and not on game_over event
    if game.session.status == SDK.GameStatus.over
      # stop any turn timers
      stopTurnTimer(gameId)
      if !game.isArchived?
        game.isArchived = true
        afterGameOver(gameId, game.session, game.mouseAndUIEvents)

###*
 * Handler for an invalid action.
 ###
onInvalidAction = (event) ->
  # safety fallback: if player attempts to make an invalid explicit action, notify that player only
  gameSession = event.gameSession
  gameId = gameSession.gameId
  game = games[gameId]
  if game?
    action = event.action
    if !action.getIsImplicit()
      #Logger.module("...").log "[G:#{gameId}]", "onInvalidAction -> INVALID ACTION: #{action.getLogName()} / VALIDATED BY: #{action.getValidatorType()} / MESSAGE: #{action.getValidationMessage()}"
      invalidActionEventData = {
        type: EVENTS.invalid_action,
        playerId: action.getOwnerId(),
        action: JSON.parse(game.session.serializeToJSON(action)),
        validatorType: event.validatorType,
        validationMessage: event.validationMessage,
        validationMessagePosition: event.validationMessagePosition,
        desync: gameSession.isActive() and
          gameSession.getCurrentPlayerId() == action.getOwnerId() and
          gameSession.getTurnTimeRemaining() > CONFIG.TURN_DURATION_LATENCY_BUFFER
      }
      emitGameEvent(null, gameId, invalidActionEventData)

###
# Subscribes to the gamesession's event bus.
# Can be called multiple times in order to re-subscribe.
# @public
# @param  {Object}    gameId      The game ID to subscribe for.
###
subscribeToGameSessionEvents = (gameId)->
  Logger.module("...").log "[G:#{gameId}]", "subscribeToGameSessionEvents -> subscribing to GameSession events"
  game = games[gameId]
  if game?
    # unsubscribe from previous
    unsubscribeFromGameSessionEvents(gameId)

    # listen for game events
    game.session.getEventBus().on(EVENTS.before_rollback_to_snapshot, onBeforeRollbackToSnapshot)
    game.session.getEventBus().on(EVENTS.step, onStep)
    game.session.getEventBus().on(EVENTS.invalid_action, onInvalidAction)

    # subscribe AI to events
    ai_subscribeToGameSessionEvents(gameId)

###
# Unsubscribe from event listeners on the game session for this game ID.
# @public
# @param  {String}    gameId      The game ID that needs to be unsubscribed.
###
unsubscribeFromGameSessionEvents = (gameId)->
  Logger.module("...").log "[G:#{gameId}]", "unsubscribeFromGameSessionEvents -> un-subscribing from GameSession events"
  game = games[gameId]
  if game?
    game.session.getEventBus().off(EVENTS.before_rollback_to_snapshot, onBeforeRollbackToSnapshot)
    game.session.getEventBus().off(EVENTS.step, onStep)
    game.session.getEventBus().off(EVENTS.invalid_action, onInvalidAction)

    ai_unsubscribeFromGameSessionEvents(gameId)

###
# must be called after game is over
# processes a game, saves to redis, and kicks-off post-game processing jobs
# @public
# @param  {String}    gameId        The game ID that is over.
# @param  {Object}    gameSession      The game session data.
# @param  {Array}      mouseAndUIEvents  The mouse and UI events for this game.
###
afterGameOver = (gameId, gameSession, mouseAndUIEvents) ->

  Logger.module("GAME-OVER").log "[G:#{gameId}]", "---------- ======= GAME #{gameId} OVER ======= ---------".green

  # Update User Ranking, Progression, Quests, Stats
  updateUser = (userId, opponentId, gameId, factionId, generalId, isWinner, isDraw, ticketId) ->

    Logger.module("GAME-OVER").log "[G:#{gameId}]", "UPDATING user #{userId}. (winner:#{isWinner})"

    # check for isFriendly
    # check for isUnscored
    isFriendly = gameSession.gameType == SDK.GameType.Friendly
    isUnscored = false

    # Ranking and Progression only process in NON-FRIENDLY matches
    if not isFriendly

      # calculate based on number of resign status and number of actions
      lastStep = gameSession.getLastStep()
      # if the game didn't have a single turn, mark the game as unscored
      if gameSession.getPlayerById(userId).hasResigned and gameSession.getTurns().length == 0
        Logger.module("GAME-OVER").log "[G:#{gameId}]", "User: #{userId} CONCEDED a game with 0 turns. Marking as UNSCORED".yellow
        isUnscored = true
      else if not isWinner and not isDraw
        # otherwise check how many actions the player took
        playerActionCount = 0
        meaningfulActionCount = 0
        moveActionCount = 0
        for a in gameSession.getActions()

          # explicit actions
          if a.getOwnerId() == userId && a.getIsImplicit() == false
            playerActionCount++

            # meaningful actions
            if a instanceof SDK.AttackAction
              if a.getTarget().getIsGeneral()
                meaningfulActionCount += 2
              else
                meaningfulActionCount += 1
            if a instanceof SDK.PlayCardFromHandAction or a instanceof SDK.PlaySignatureCardAction
              meaningfulActionCount += 1
            if a instanceof SDK.BonusManaAction
              meaningfulActionCount += 2

            # move actions
            if a instanceof SDK.MoveAction
              moveActionCount += 1

          # more than 9 explicit actions
          # more than 1 move action
          # more than 5 meaningful actions
          if playerActionCount > 9 and moveActionCount > 1 and meaningfulActionCount > 4
            break

        ###
        what we're looking for:
        * more than 9 explicit actions
        * more than 1 move action
        * more than 5 meaningful actions
        ... otherwise mark the game as unscored
        ###
        # Logger.module("GAME-OVER").log "[G:#{gameId}]", "User: #{userId} #{playerActionCount}, #{moveActionCount}, #{meaningfulActionCount}".cyan
        if playerActionCount <= 9 or moveActionCount <= 1 or meaningfulActionCount <= 4
          Logger.module("GAME-OVER").log "[G:#{gameId}]", "User: #{userId} CONCEDED a game with too few meaningful actions. Marking as UNSCORED".yellow
          isUnscored = true

    # start the job to process the game for a user
    Jobs.create("update-user-post-game",
      name: "Update User Ranking"
      title: util.format("User %s :: Game %s", userId, gameId)
      userId: userId
      opponentId: opponentId
      gameId: gameId
      gameType: gameSession.gameType
      factionId: factionId
      generalId: generalId
      isWinner: isWinner
      isDraw: isDraw
      isUnscored: isUnscored
      isBotGame: true
      ticketId: ticketId
    ).removeOnComplete(true).save()

  # Save then archive game session
  archiveGame = (gameId, gameSession, mouseAndUIEvents) ->

    Promise.all([
      GameManager.saveGameMouseUIData(gameId, JSON.stringify(mouseAndUIEvents)),
      GameManager.saveGameSession(gameId, gameSession.serializeToJSON(gameSession))
    ]).then () ->
      # Job: Archive Game
      Jobs.create("archive-game",
        name: "Archive Game"
        title: util.format("Archiving Game %s", gameId)
        gameId: gameId
        gameType: gameSession.gameType
      ).removeOnComplete(true).save()

  # update promises
  promises = [
    archiveGame(gameId, gameSession, mouseAndUIEvents)
  ]

  for player in gameSession.players
    playerId = player.getPlayerId()
    # don't update normal AI (non-bot user)
    if playerId != CONFIG.AI_PLAYER_ID
      # find player data
      winnerId = gameSession.getWinnerId()
      isWinner = (playerId == winnerId)
      isDraw = if !winnerId? then true else false
      playerSetupData = gameSession.getPlayerSetupDataForPlayerId(playerId)
      playerFactionId = playerSetupData.factionId
      generalId = playerSetupData.generalId
      ticketId = playerSetupData.ticketId
      promises.push(updateUser(playerId,CONFIG.AI_PLAYER_ID,gameId,playerFactionId,generalId,isWinner,isDraw,ticketId))

  # execute promises
  Promise.all(promises)
  .then () ->
    Logger.module("GAME-OVER").log "[G:#{gameId}]", "afterGameOver done, game has been archived".green
  .catch (error) ->
    Logger.module("GAME-OVER").error "[G:#{gameId}]", "ERROR: afterGameOver failed #{error}".red

### Shutdown Handler ###
shutdownHandler = () ->
  Logger.module("SERVER").log "Received shutdown signal; shutting down SP server."
  Logger.module("SERVER").log "Active Players: #{playerCount}."
  Logger.module("SERVER").log "Active Games: #{gameCount}."

  if !config.get('consul.enabled')
    process.exit(0)

  return Consul.getReassignmentStatus()
  .then (reassign) ->
    if reassign == false
      Logger.module("SERVER").log "Reassignment disabled - exiting."
      process.exit(0)

    # Build an array of game IDs
    ids = []
    _.each games, (game, id) ->
      ids.push(id)

    # Map to save each game to Redis before shutdown
    return Promise.map ids, (id) ->
      serializedData = games[id].session.serializeToJSON(games[id].session)
      return GameManager.saveGameSession(id, serializedData)
    .then () ->
      return Consul.getHealthyServers()
    .then (servers) ->
      # Filter 'yourself' from list of nodes
      filtered = _.reject servers, (server)->
        return server["Node"]?["Node"] == os.hostname()

      if filtered.length == 0
        Logger.module("SERVER").log "No servers available - exiting without re-assignment."
        process.exit(1)

      random_node = _.sample(filtered)
      node_name = random_node["Node"]?["Node"]
      return Consul.kv.get("nodes/#{node_name}/public_ip")
    .then (newServerIp) ->
      # Development override for testing, bounces between port 9000 & 9001
      if config.isDevelopment()
        port = 9001 if config.get('port') is 9000
        port = 9000 if config.get('port') is 9001
        newServerIp = "127.0.0.1:#{port}"
      msg = "Server is shutting down. You will be reconnected automatically."
      io.emit "game_server_shutdown", {msg:msg,ip:newServerIp}
      Logger.module("SERVER").log "Players reconnecting to: #{newServerIp}"
      Logger.module("SERVER").log "Re-assignment complete. Exiting."
      process.exit(0)
    .catch (err) ->
      Logger.module("SERVER").log "Re-assignment failed: #{err.message}. Exiting."
      process.exit(1)

process.on "SIGTERM", shutdownHandler
process.on "SIGINT", shutdownHandler
process.on "SIGHUP", shutdownHandler
process.on "SIGQUIT", shutdownHandler

# region AI

###*
 * Returns whether a session is valid for AI usage.
 * @param  {String}    gameId
###
ai_isValidSession = (gameId) ->
  return games[gameId]?.session? and !games[gameId].session.isOver() and games[gameId].ai?

###*
 * Returns whether a session and turn is valid for AI usage.
 * @param  {String}    gameId
###
ai_isValidTurn = (gameId) ->
  return ai_isValidSession(gameId) and games[gameId].session.isActive() and games[gameId].session.getCurrentPlayerId() == games[gameId].ai.getMyPlayerId()

###*
 * Returns whether AI can start turn.
 * @param  {String}    gameId
###
ai_canStartTurn = (gameId) ->
  return ai_isValidTurn(gameId) and !ai_isExecutingTurn(gameId) and !games[gameId].session.hasStepsInQueue()

###*
 * Returns whether ai is currently executing turn.
 * @param  {String}    gameId
###
ai_isExecutingTurn = (gameId) ->
  return games[gameId].executingAITurn

###*
 * Returns whether ai can progress turn.
 * @param  {String}    gameId
###
ai_canProgressTurn = (gameId) ->
  return ai_isValidTurn(gameId) and ai_isExecutingTurn(gameId) and !games[gameId].aiStartTurnTimeoutId?

###*
 * Returns whether ai can taunt.
 * @param  {String}    gameId
###
ai_canEmote = (gameId) ->
  return ai_isValidSession(gameId) and !ai_isBot(gameId) and !games[gameId].session.getIsBufferingEvents() and Math.random() < 0.05

###*
 * Returns whether ai is normal ai or bot.
 * @param  {String}    gameId
###
ai_isBot = (gameId) ->
  return games[gameId]?.session? and games[gameId].session.getAiPlayerId() != CONFIG.AI_PLAYER_ID

###*
 * Initializes AI for a game session.
 * @param  {String}    gameId
###
ai_setup = (gameId) ->
  if games[gameId]?.session? and !games[gameId].ai?
    aiPlayerId = games[gameId].session.getAiPlayerId()
    aiDifficulty = games[gameId].session.getAiDifficulty()
    Logger.module("AI").debug "[G:#{gameId}]", "Setup AI -> aiPlayerId #{aiPlayerId} - aiDifficulty #{aiDifficulty}"
    games[gameId].ai = new StarterAI(games[gameId].session, aiPlayerId, aiDifficulty)

    # add AI as a connected player
    games[gameId].connectedPlayers.push(games[gameId].session.getAiPlayerId())

    # attempt to mulligan immediately on new game
    if games[gameId].session.isNew()
      nextAction = games[gameId].ai.nextAction()
      if nextAction?
        games[gameId].session.executeAction(nextAction)

###*
 * Terminates AI for a game session.
 * @param  {String}    gameId
###
ai_terminate = (gameId) ->
  ai_unsubscribeFromGameSessionEvents(gameId)
  ai_stopTurn(gameId)
  ai_stopTimeouts(gameId)

ai_onStep = (event) ->
  gameSession = event.gameSession
  gameId = gameSession.gameId
  # emote after step
  ai_emoteForLastStep(gameId)

  # progress turn
  ai_updateTurn(gameId)

ai_onInvalidAction = (event) ->
  # safety fallback: if AI attempts to make an invalid explicit action, end AI turn immediately
  if event?
    gameSession = event.gameSession
    gameId = gameSession.gameId
    action = event.action
    if action? and !action.getIsImplicit() and ai_isExecutingTurn(gameId) and action.getOwnerId() == games[gameId].ai.getMyPlayerId()
      ai_endTurn(gameId)

ai_subscribeToGameSessionEvents = (gameId) ->
  game = games[gameId]
  if game?
    # if we're already subscribed, unsubscribe
    ai_unsubscribeFromGameSessionEvents(gameId)

    # listen for game events
    game.session.getEventBus().on(EVENTS.step, ai_onStep)
    game.session.getEventBus().on(EVENTS.invalid_action, ai_onInvalidAction)

ai_unsubscribeFromGameSessionEvents = (gameId) ->
  game = games[gameId]
  if game?
    game.session.getEventBus().off(EVENTS.step, ai_onStep)
    game.session.getEventBus().off(EVENTS.invalid_action, ai_onInvalidAction)

###*
 * Updates AI turn for a game session.
 * @param  {String}    gameId
###
ai_updateTurn = (gameId) ->
  Logger.module("AI").debug "[G:#{gameId}]", "ai_updateTurn"
  if ai_canStartTurn(gameId)
    ai_startTurn(gameId)
  else if ai_canProgressTurn(gameId)
    ai_progressTurn(gameId)
  else if ai_isExecutingTurn(gameId)
    ai_endTurn(gameId)

###*
 * Progresses AI turn for a game session.
 * @param  {String}    gameId
###
ai_progressTurn = (gameId) ->
  if ai_canProgressTurn(gameId)
    Logger.module("AI").debug "[G:#{gameId}]", "ai_progressTurn".cyan
    # request next action from AI
    try
      nextAction = games[gameId].ai.nextAction()
    catch error
      Logger.module("IO").log "[G:#{gameId}]", "ai.nextAction:: error: #{JSON.stringify(error.message)}".red
      Logger.module("IO").log "[G:#{gameId}]", "ai.nextAction:: error stack: #{error.stack}".red

      # retain player id
      playerId = games[gameId].ai.getOpponentPlayerId()

      # delete but don't destroy game
      destroyGameSessionIfNoConnectionsLeft(gameId,true)

      # send error to client, forcing reconnect on client side
      io.to(gameId).emit EVENTS.network_game_error, JSON.stringify(error.message)
      return

  # if we didn't have an error and somehow destroy the game data in the try/catch above
  if games[gameId]?
    if nextAction?
      # always delay AI actions slightly
      if !games[gameId].aiExecuteActionTimeoutId?
        if ai_isBot(gameId)
          if games[gameId].session.getIsFollowupActive()
            actionDelayTime = 1.0 + Math.random() * 3.0
          else if nextAction instanceof SDK.EndTurnAction
            actionDelayTime = 1.0 + Math.random() * 2.0
          else
            actionDelayTime = 1.0 + Math.random() * 8.0
        else
          if games[gameId].session.getIsFollowupActive()
            actionDelayTime = 0.0
          else
            actionDelayTime = 5.0

        # action delay time can never be more than a quarter of remaining turn time
        if games[gameId].turnTimeRemaining?
          actionDelayTime = Math.min((games[gameId].turnTimeRemaining * 0.25) / 1000.0, actionDelayTime)

        # show UI as needed
        ai_showUIForAction(gameId, nextAction, actionDelayTime)

        # delay and then execute action
        # delay must be at least 1 ms to ensure current call stack completes
        games[gameId].aiExecuteActionTimeoutId = setTimeout((() ->
          games[gameId].aiExecuteActionTimeoutId = null
          ai_showClearUI(gameId)
          ai_executeAction(gameId, nextAction)
        ), Math.max(1.0, actionDelayTime * 1000.0))
    else if ai_isExecutingTurn(gameId)
      # end turn as needed
      ai_endTurn(gameId)

###*
 * Starts AI turn for a game session.
 * @param  {String}    gameId
###
ai_startTurn = (gameId) ->
  if ai_canStartTurn(gameId)
    Logger.module("AI").debug "[G:#{gameId}]", "ai_startTurn".cyan
    # set as executing AI turn
    games[gameId].executingAITurn = true

    if !games[gameId].aiStartTurnTimeoutId?
      # delay initial turn progress
      if ai_isBot(gameId)
        delayTime = 2.0 + Math.random() * 2.0
      else
        delayTime = 2.0

      # choose random starting point for pointer
      games[gameId].aiPointer = {
        x: Math.floor(Math.random() * CONFIG.BOARDCOL),
        y: Math.floor(Math.random() * CONFIG.BOARDROW)
      }
      Logger.module("AI").debug "[G:#{gameId}]", "ai_startTurn init aiPointer at #{games[gameId].aiPointer.x}, #{games[gameId].aiPointer.y}".cyan

      # delay must be at least 1 ms to ensure current call stack completes
      games[gameId].aiStartTurnTimeoutId = setTimeout((()->
        games[gameId].aiStartTurnTimeoutId = null
        ai_progressTurn(gameId)
      ), Math.max(1.0, delayTime * 1000.0))

###*
 * Stops AI turn for a game session, and ends it if necessary.
 * @param  {String}    gameId
###
ai_endTurn = (gameId) ->
  # stop turn
  ai_stopTurn(gameId)

  # force end turn if still AI's turn
  if ai_isValidTurn(gameId)
    Logger.module("AI").debug "[G:#{gameId}]", "ai_endTurn".cyan
    ai_executeAction(gameId, games[gameId].session.actionEndTurn())

###*
 * Stops AI turn for a game session. Does not end AI turn.
 * @param  {String}    gameId
###
ai_stopTurn = (gameId) ->
  if games[gameId].executingAITurn
    Logger.module("AI").debug "[G:#{gameId}]", "ai_stopTurn".cyan
    games[gameId].executingAITurn = false

    ai_stopTurnTimeouts(gameId)

###*
 * Stops AI timeouts for a game session.
 * @param  {String}    gameId
###
ai_stopTimeouts = (gameId) ->
  ai_stopTurnTimeouts(gameId)
  ai_stopEmoteTimeouts(gameId)
  ai_stopUITimeouts(gameId)

###*
 * Stops AI timeouts for turn actions.
 * @param  {String}    gameId
###
ai_stopTurnTimeouts = (gameId) ->
  if games[gameId].aiStartTurnTimeoutId?
    clearTimeout(games[gameId].aiStartTurnTimeoutId)
    games[gameId].aiStartTurnTimeoutId = null

  if games[gameId].aiExecuteActionTimeoutId?
    clearTimeout(games[gameId].aiExecuteActionTimeoutId)
    games[gameId].aiExecuteActionTimeoutId = null

###*
 * Executes an AI action for a game session.
 * @param  {String}    gameId
 * @param  {Action}    action
###
ai_executeAction = (gameId, action) ->
  if ai_canProgressTurn(gameId)
    Logger.module("AI").debug "[G:#{gameId}]", "ai_executeAction -> #{action.getLogName()}".cyan
    # simulate AI sending step to server
    step = new SDK.Step(games[gameId].session, action.getOwnerId())
    step.setAction(action)
    opponentPlayerId = games[gameId].ai.getOpponentPlayerId()
    io.sockets.adapter.rooms.get(gameId)?.forEach((socketId) ->
      socket = io.sockets.sockets.get(socketId)
      if socket.playerId == opponentPlayerId and !socket.spectatorId
        onGameEvent.call(socket, {
          type: EVENTS.step
          step: JSON.parse(games[gameId].session.serializeToJSON(step))
        })
    )

###*
* Returns whether an action is valid for showing UI.
* @param {String} gameId
* @param {Action} action
* @return {Boolean}
###
ai_isValidActionForUI = (gameId, action) ->
  return (games[gameId].session.getIsFollowupActive() and !(action instanceof SDK.EndFollowupAction)) or
    action instanceof SDK.ReplaceCardFromHandAction or
    action instanceof SDK.PlayCardFromHandAction or
    action instanceof SDK.PlaySignatureCardAction or
    action instanceof SDK.MoveAction or
    action instanceof SDK.AttackAction

###*
* Shows UI for an action that will be taken by AI.
* @param  {String}    gameId
* @param  {Action}    action
* @param  {Number}    actionDelayTime must be at least 0.25s or greater
###
ai_showUIForAction = (gameId, action, actionDelayTime) ->
  if ai_isValidTurn(gameId) and ai_isValidActionForUI(gameId, action) and _.isNumber(actionDelayTime) and actionDelayTime > 0.25
    aiPlayerId = games[gameId].ai.getMyPlayerId()

    # stop any previous UI animations
    ai_stopUITimeouts(gameId)

    # get ui animation times
    if ai_isBot(gameId)
      if games[gameId].session.getIsFollowupActive()
        uiDelayTime = actionDelayTime * (0.7 + Math.random() * 0.1)
        uiAnimationDuration = actionDelayTime - uiDelayTime
        moveToSelectDuration = 0.0
        pauseAtSelectDuration = 0.0
        pauseAtTargetDuration = (0.1 + Math.random() * 0.25) * uiAnimationDuration
        moveToTargetDuration = uiAnimationDuration - pauseAtTargetDuration
      else
        uiDelayTime = actionDelayTime * (0.4 + Math.random() * 0.4)
        uiAnimationDuration = actionDelayTime - uiDelayTime
        pauseAtTargetDuration = Math.min(1.0, (0.1 + Math.random() * 0.25) * uiAnimationDuration)
        moveToSelectDuration = (0.2 + Math.random() * 0.4) * (uiAnimationDuration - pauseAtTargetDuration)
        moveToTargetDuration = (0.4 + Math.random() * 0.5) * (uiAnimationDuration - pauseAtTargetDuration - moveToSelectDuration)
        pauseAtSelectDuration = uiAnimationDuration - pauseAtTargetDuration - moveToSelectDuration - moveToTargetDuration
    else
      uiDelayTime = actionDelayTime * 0.7
      uiAnimationDuration = actionDelayTime - uiDelayTime
      moveToSelectDuration = 0.0
      pauseAtSelectDuration = 0.0
      moveToTargetDuration = 0.0
      pauseAtTargetDuration = uiAnimationDuration

    # get action properties
    selectEventData = {
      type: EVENTS.network_game_select
      playerId: aiPlayerId
    }
    if action instanceof SDK.ReplaceCardFromHandAction
      intent = selectEventData.intentType = SDK.IntentType.DeckIntent
      handIndex = selectEventData.handIndex = action.getIndexOfCardInHand()
      selectPosition = { x: Math.round((handIndex + 0.5) * (CONFIG.BOARDCOL / CONFIG.MAX_HAND_SIZE)), y: -1 }
    else if action instanceof SDK.ApplyCardToBoardAction
      if action instanceof SDK.PlayCardFromHandAction
        intent = selectEventData.intentType = SDK.IntentType.DeckIntent
        handIndex = selectEventData.handIndex = action.getIndexOfCardInHand()
        selectPosition = { x: Math.round((handIndex + 0.5) * (CONFIG.BOARDCOL / CONFIG.MAX_HAND_SIZE)), y: -1 }
        targetPosition = action.getTargetPosition()
      else if action instanceof SDK.PlaySignatureCardAction
        intent = selectEventData.intentType = SDK.IntentType.DeckIntent
        isSignatureCard = true
        if action.getCard().isOwnedByPlayer2()
          selectEventData.player2SignatureCard = true
        else
          selectEventData.player1SignatureCard = true
        if aiPlayerId == games[gameId].session.getPlayer2Id()
          selectPosition = { x: CONFIG.BOARDCOL, y: Math.floor(CONFIG.BOARDROW * 0.5 + Math.random() * CONFIG.BOARDROW * 0.5) }
        else
          selectPosition = { x: -1, y: Math.floor(CONFIG.BOARDROW * 0.5 + Math.random() * CONFIG.BOARDROW * 0.5) }
        targetPosition = action.getTargetPosition()
      else
        # followup has no selection
        intent = selectEventData.intentType = SDK.IntentType.DeckIntent
        selectEventData = null
        selectPosition = action.getSourcePosition()
        targetPosition = action.getTargetPosition()
    else if action instanceof SDK.MoveAction
      intent = selectEventData.intentType = SDK.IntentType.MoveIntent
      cardIndex = selectEventData.cardIndex = action.getSourceIndex()
      card = games[gameId].session.getCardByIndex(cardIndex)
      selectPosition = card.getPosition()
      targetPosition = action.getTargetPosition()
    else if action instanceof SDK.AttackAction
      intent = selectEventData.intentType = SDK.IntentType.DamageIntent
      cardIndex = selectEventData.cardIndex = action.getSourceIndex()
      card = games[gameId].session.getCardByIndex(cardIndex)
      selectPosition = card.getPosition()
      targetPosition = action.getTargetPosition()

    # failsafe in case action doesn't have a select position
    # (actions should always have a select position)
    if !selectPosition?
      if action instanceof SDK.ApplyCardToBoardAction
        Logger.module("AI").log "[G:#{gameId}]", "ai_showUIForAction -> no sel pos #{action.getLogName()} w/ card #{action.getCard()?.getName()} w/ root #{action.getCard()?.getRootCard()?.getName()}".cyan
      else
        Logger.module("AI").log "[G:#{gameId}]", "ai_showUIForAction -> no sel pos #{action.getLogName()}".cyan
      return

    # setup sequence
    actionPointerSequence = () ->
      # move to select
      ai_animatePointer(gameId, moveToSelectDuration, selectPosition, SDK.IntentType.NeutralIntent, false, isSignatureCard, () ->
        if selectEventData?
          if action instanceof SDK.MoveAction or action instanceof SDK.AttackAction
            # clear pointer before select
            emitGameEvent(null, gameId, {
              type: EVENTS.network_game_mouse_clear
              playerId: aiPlayerId,
              intentType: SDK.IntentType.NeutralIntent
            })

          # show selection event
          emitGameEvent(null, gameId, selectEventData)

        if targetPosition?
          # pause at select
          ai_animatePointer(gameId, pauseAtSelectDuration, selectPosition, intent, isSignatureCard, false, () ->
            # move to target
            ai_animatePointer(gameId, moveToTargetDuration, targetPosition, intent)
          )
      )

    # random chance to hover enemy unit on the board
    if ai_isBot(gameId) and uiDelayTime >= 5.0 && Math.random() < 0.05
      opponentGeneral = games[gameId].session.getGeneralForOpponentOfPlayerId(games[gameId].session.getAiPlayerId())
      units = games[gameId].session.getBoard().getFriendlyEntitiesForEntity(opponentGeneral)
      if units.length > 0
        unitToHover = units[Math.floor(Math.random() * units.length)]

    if unitToHover?
      # hover unit before showing action UI
      unitPosition = unitToHover.getPosition()
      moveToUnitDuration = Math.random() * 1.0
      pauseAtUnitDuration = 2.0 + Math.random() * 2.0
      uiDelayTime = uiDelayTime - moveToUnitDuration - pauseAtUnitDuration

      # delay for remaining time
      games[gameId].aiShowUITimeoutId = setTimeout(() ->
        games[gameId].aiShowUITimeoutId = null
        # move to random unit
        ai_animatePointer(gameId, moveToUnitDuration, unitPosition, SDK.IntentType.NeutralIntent, false, false, () ->
          # pause at random unit and then show action pointer sequence
          games[gameId].aiShowUITimeoutId = setTimeout(() ->
            games[gameId].aiShowUITimeoutId = null
            actionPointerSequence()
          , pauseAtUnitDuration * 1000.0)
        )
      , uiDelayTime * 1000.0)
    else
      # delay and then show action pointer sequence
      games[gameId].aiShowUITimeoutId = setTimeout(() ->
        games[gameId].aiShowUITimeoutId = null
        actionPointerSequence()
      , uiDelayTime * 1000.0)

ai_showClearUI = (gameId) ->
  if ai_isValidTurn(gameId)
    ai_stopUITimeouts(gameId)
    emitGameEvent(null, gameId, {
      type: EVENTS.network_game_mouse_clear
      playerId: games[gameId].ai.getMyPlayerId(),
      intentType: SDK.IntentType.NeutralIntent
    })

###*
 * Clears out any timeouts for AI UI.
 * @param  {String}    gameId
 ###
ai_stopUITimeouts = (gameId) ->
  if games[gameId]?
    if games[gameId].aiShowUITimeoutId?
      clearTimeout(games[gameId].aiShowUITimeoutId)
      games[gameId].aiShowUITimeoutId = null

    ai_stopAnimatingPointer(gameId)

###*
 * Shows AI pointer hover at a board position if it is different from the current position.
* @param  {String}    gameId
* @param  {Number}    boardX
* @param  {Number}    boardY
* @param  {Number}    [intent]
* @param  {Number}    [isSignatureCard=false]
 ###
ai_showHover = (gameId, boardX, boardY, intent=SDK.IntentType.NeutralIntent, isSignatureCard=false) ->
  if ai_isValidTurn(gameId)
    pointer = games[gameId].aiPointer
    if pointer.x != boardX or pointer.y != boardY
      # set pointer to position
      pointer.x = boardX
      pointer.y = boardY

      # setup hover event data
      hoverEventData = {
        type: EVENTS.network_game_hover
        boardPosition: {x: boardX, y: boardY},
        playerId: games[gameId].ai.getMyPlayerId(),
        intentType: intent
      }

      # check for hover target
      if isSignatureCard
        if games[gameId].ai.getMyPlayerId() == games[gameId].session.getPlayer2Id()
          hoverEventData.player2SignatureCard = true
        else
          hoverEventData.player1SignatureCard = true
      else
        target = games[gameId].session.getBoard().getUnitAtPosition(pointer)
        if target?
          hoverEventData.cardIndex = target.getIndex()

      # show hover
      emitGameEvent(null, gameId, hoverEventData)

###*
* Animates AI pointer movement.
* @param  {String}    gameId
* @param  {Number}    duration in seconds
* @param  {Vec2}    [targetBoardPosition]
* @param  {Number}    [intent]
* @param  {Number}    [isSignatureCardAtSource]
* @param  {Number}    [isSignatureCardAtTarget]
* @param  {Function}    [callback]
###
ai_animatePointer = (gameId, duration, targetBoardPosition, intent, isSignatureCardAtSource, isSignatureCardAtTarget, callback) ->
  if ai_isValidTurn(gameId)
    # stop current animation
    ai_stopAnimatingPointer(gameId)

    pointer = games[gameId].aiPointer
    sx = pointer.x
    sy = pointer.y
    tx = targetBoardPosition.x
    ty = targetBoardPosition.y
    dx = tx - sx
    dy = ty - sy

    if duration > 0.0
      # show pointer at source
      ai_showHover(gameId, sx, sy, intent, isSignatureCardAtSource)

      # animate to target
      dms = duration * 1000.0
      startTime = Date.now()
      games[gameId].aiPointerIntervalId = setInterval(() ->
        # cubic ease out
        currentTime = Date.now()
        dt = currentTime - startTime
        val = Math.min(1.0, dt / dms)
        e = val - 1
        ee = e * e * e + 1
        cx = dx * ee + sx
        cy = dy * ee + sy
        ai_showHover(gameId, Math.round(cx), Math.round(cy), intent, isSignatureCardAtTarget)
        if val == 1.0
          ai_stopAnimatingPointer(gameId)
          if callback then callback()
      , dms / 10)
    else
      # show pointer at target
      ai_showHover(gameId, tx, ty, intent, isSignatureCardAtTarget)

      # no animation needed
      if callback then callback()

###*
 * Stops showing AI pointer movement.
 ###
ai_stopAnimatingPointer = (gameId) ->
  if games[gameId]? and games[gameId].aiPointerIntervalId != null
    clearInterval(games[gameId].aiPointerIntervalId)
    games[gameId].aiPointerIntervalId = null

###*
 * Prompts AI to emote to opponent based on last step.
 * @param {String} gameId
###
ai_emoteForLastStep = (gameId) ->
  if ai_canEmote(gameId)
    step = games[gameId].session.getLastStep()
    action = step?.action
    if action? and !(action instanceof SDK.EndTurnAction)
      aiPlayerId = games[gameId].ai.getMyPlayerId()
      isMyAction = action.getOwnerId() == aiPlayerId

      # search action + sub actions for any played or removed units
      actionsToSearch = [action]
      numHappyActions = 0
      numTauntingActions = 0
      numAngryActions = 0
      while actionsToSearch.length > 0
        searchAction = actionsToSearch.shift()
        if searchAction instanceof SDK.RemoveAction
          if !isMyAction and searchAction.getTarget()?.getOwnerId() == aiPlayerId
            numAngryActions += 2
          else if isMyAction and searchAction.getTarget()?.getOwnerId() != aiPlayerId
            numTauntingActions += 1
        else if searchAction instanceof SDK.HealAction
          if isMyAction and searchAction.getTarget()?.getOwnerId() == aiPlayerId
            numTauntingActions += 1
          else if !isMyAction and searchAction.getTarget()?.getOwnerId() != aiPlayerId
            numAngryActions += 1
        else if searchAction instanceof SDK.PlayCardFromHandAction or searchAction instanceof SDK.PlaySignatureCardAction
          if isMyAction and searchAction.getCard() instanceof SDK.Unit
            numHappyActions += 1

        # add sub actions
        actionsToSearch = actionsToSearch.concat(searchAction.getSubActions())

      maxEmotion = Math.max(numHappyActions, numTauntingActions, numAngryActions)
      if maxEmotion > 0
        emoteIds = []
        myGeneral = games[gameId].ai.getMyGeneral()
        myGeneralId = myGeneral.getId()
        factionEmotesData = SDK.CosmeticsFactory.cosmeticsForTypeAndFaction(SDK.CosmeticsTypeLookup.Emote, myGeneral.getFactionId())

        # use ai faction emote that were most present in last step
        if maxEmotion == numAngryActions
          for emoteData in factionEmotesData
            if emoteData.enabled and (emoteData.title == "Angry" or emoteData.title == "Sad" or emoteData.title == "Frustrated") and (emoteData.generalId == myGeneralId)
              emoteIds.push(emoteData.id)
        else if maxEmotion == numHappyActions
          for emoteData in factionEmotesData
            if emoteData.enabled and emoteData.title == "Happy" and (emoteData.generalId == myGeneralId)
              emoteIds.push(emoteData.id)
        else if maxEmotion == numTauntingActions
          for emoteData in factionEmotesData
            if emoteData.enabled and (emoteData.title == "Taunt" or emoteData.title == "Sunglasses" or emoteData.title == "Kiss") and (emoteData.generalId == myGeneralId)
              emoteIds.push(emoteData.id)

        # pick a random emote
        emoteId = emoteIds[Math.floor(Math.random() * emoteIds.length)]
      #Logger.module("AI").debug "[G:#{gameId}]", "ai_emoteForLastStep -> #{emoteId} for #{games[gameId].session.getLastStep()?.action?.getLogName()}".cyan
      if emoteId?
        # clear any waiting emote timeout
        ai_stopEmoteTimeouts(gameId)

        # delay must be at least 1 ms to ensure current call stack completes
        games[gameId].aiEmoteTimeoutId = setTimeout((()->
          games[gameId].aiEmoteTimeoutId = null
          #Logger.module("AI").debug "[G:#{gameId}]", "ai_showEmote -> #{emoteId}".cyan
          emitGameEvent(null, gameId, {
            type: EVENTS.show_emote
            id: emoteId,
            playerId: games[gameId].ai.getMyPlayerId()
          })
        ), 4000.0)

###*
 * Stops AI timeouts for emotes.
 * @param  {String}    gameId
###
ai_stopEmoteTimeouts = (gameId) ->
  if games[gameId].aiEmoteTimeoutId?
    clearTimeout(games[gameId].aiEmoteTimeoutId)
    games[gameId].aiEmoteTimeoutId = null

# endregion AI
