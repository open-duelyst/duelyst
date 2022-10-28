_ = require 'underscore'
io = require 'socket.io-client'
EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Storage = require 'app/common/storage'
GameSession = require './gameSession'
ApplyCardToBoardAction = require './actions/applyCardToBoardAction'
GameType = require 'app/sdk/gameType.coffee'

class NetworkManager
  instance = null

  class _NetworkManager
    connected: false
    disconnected: true
    firebaseURL: process.env.FIREBASE_URL
    gameId: null
    playerId: null
    spectatorId: null
    spectateToken: null
    gameRef: null
    socket: null
    socketManager: null
    isOpponentConnected: null
    spectators: null,
    _eventBus: null
    _emitEventsAfterTimestamp: null
    _connectionCheckTimeout: null

    # NetworkManager is a singleton
    # Constructor only called once
    constructor: () ->
      Logger.module("SDK").debug "NetworkManager::new"
      @_eventBus = EventBus.create()
      @spectators = new Backbone.Collection()

    getEventBus: () ->
      return @_eventBus

    # connect to a specific game
    # TODO: modify to opts and pass in jwt token for auth
    connect: (gameType, gameId, playerId, gameServerAddress, spectatorId=null, spectateToken=null) ->
      if @connected
        Logger.module("SDK").warn "NetworkManager already connected."
        return

      Logger.module("SDK").debug "NetworkManager:connect -> gameId: " + gameId
      @gameId = gameId
      @playerId = playerId + ""
      @spectatorId = spectatorId
      @spectateToken = spectateToken
      @isOpponentConnected = undefined
      @_emitEventsAfterTimestamp = Date.now()
      @spectators = new Backbone.Collection()

      TelemetryManager.getInstance().setSignal("game","connecting")
      token = Storage.get('token')

      # Determine which WebSocket protocol to use.
      # Use secure WebSockets in staging and production.
      env = process.env.NODE_ENV || 'development'
      protocol = if env == 'development' then 'ws' else 'wss'

      # Determine which WebSocket host to use.
      # Use the assigned game server if one was provided.
      host = if gameServerAddress? then gameServerAddress else window.location.hostname

      # Determine which WebSocket port to use.
      # SP modes use port 8000; MP modes use port 8001.
      port = if GameType.isSinglePlayerGameType(gameType) then 8000 else 8001

      # Format the WebSocket URL.
      websocketUrl = "#{protocol}://#{host}:#{port}"
      Logger.module("SDK").warn "NetworkManager: connecting to game server #{websocketUrl}"

      # connect using socket.io manager
      @socketManager = new io.Manager(websocketUrl, {
        auth: {token: "Bearer #{token}"},
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 20,
      })

      # Connect to a specific socket on the host, currently /
      @socket = @socketManager.socket('/', {
        forceNew: true,
        auth: {
          token: "Bearer #{token}"
        }
      })

      # When the socket opens, send the token for authentication
      @socket.on 'connect', (socket) ->
        # Storage = require 'app/common/storage'
        # token = Storage.get('token')
        # @emit('authenticate', {token: token})

      # when you receive a message that the connection is ready (happens after authentication)
      @socket.on 'connected', (response) => # fat arrow to bind this
        Logger.module("IO").log "NetworkManager::IO:connected -> SUCCESS"
        Logger.module("IO").log "NetworkManager::IO:connected -> #{response.message}"
        NetworkManager.getInstance().connected = true
        NetworkManager.getInstance().disconnected = false
        if @.spectatorId
          NetworkManager.getInstance().joinGameSpectatorRoom()
        else
          NetworkManager.getInstance().joinGameRoom()

      @socket.on 'connect_error', (error)->
        Logger.module("IO").error "NetworkManager::IO:connect_error",error

      @socket.on 'reconnecting', (attempts)->
        Logger.module("IO").log "NetworkManager::IO:reconnecting attempt number " + attempts
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.reconnect_to_game, NetworkManager.getInstance().gameId)

      # BUG (socket.io) ? : This event may get triggered twice
      @socket.on 'reconnect_failed', ()->
        Logger.module("IO").log "NetworkManager::IO:reconnect failed"
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.reconnect_failed)

      @socket.on 'join_game_response', (response)->
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.join_game, response)
        if response.error
          Logger.module("IO").warn "NetworkManager::IO:join_game_response ERROR -> #{response.error}"
          NetworkManager.getInstance().disconnect()
        else
          # FIXME: `response` has type `object`; log a property instead.
          Logger.module("IO").log "NetworkManager::IO:join_game_response -> #{response}"
          isOpponentAlreadyConnected = _.find(response.connectedPlayers,(playerId) -> playerId != NetworkManager.getInstance().playerId)
          if isOpponentAlreadyConnected?
            NetworkManager.getInstance().isOpponentConnected = true
            NetworkManager.getInstance().getEventBus().trigger(EVENTS.opponent_connection_status_changed, {playerId: playerId, isConnected:true})

          NetworkManager.getInstance().spectators.add(response.connectedSpectators)

          TelemetryManager.getInstance().clearSignal("game","connecting")
          TelemetryManager.getInstance().setSignal("game","in-net-game")

      @socket.on 'spectate_game_response', (response)->
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.spectate_game, response)
        if response.error
          Logger.module("IO").warn "NetworkManager::IO:join_game_response ERROR -> #{response.error}"
          NetworkManager.getInstance().disconnect()
        else
          # FIXME: `response` has type `object`; log a property instead.
          Logger.module("IO").log "NetworkManager::IO:join_game_response -> #{response}"

          NetworkManager.getInstance().isOpponentConnected = true
          NetworkManager.getInstance().getEventBus().trigger(EVENTS.opponent_connection_status_changed, {playerId: playerId, isConnected:true})

          TelemetryManager.getInstance().clearSignal("game","connecting")
          TelemetryManager.getInstance().setSignal("game","in-net-game")

      #  when a game event is received
      @socket.on EVENTS.network_game_event, (eventData, callback)->
        Logger.module("IO").log "NetworkManager::IO:network_game_event -> #{eventData.type}; step count #{eventData.stepCount}"

        # defer the execution of the network step until the next stack call so that socket.io does not gobble up the error
        _.defer(() -> NetworkManager.getInstance().getEventBus().trigger(EVENTS.network_game_event, eventData))

      #  when a player joins the game
      @socket.on 'player_joined', (playerId,callback)->
        Logger.module("IO").log "NetworkManager::IO:player_joined -> #{playerId}"
        if playerId != NetworkManager.getInstance().playerId and not NetworkManager.getInstance().isOpponentConnected
          NetworkManager.getInstance().isOpponentConnected = true
          NetworkManager.getInstance().getEventBus().trigger(EVENTS.opponent_connection_status_changed, {playerId: playerId, isConnected:true})

      #  when a player joins the game
      @socket.on 'player_left', (playerId,callback)->
        Logger.module("IO").log "NetworkManager::IO:player_left -> #{playerId}"
        if playerId != NetworkManager.getInstance().playerId and NetworkManager.getInstance().isOpponentConnected
          NetworkManager.getInstance().isOpponentConnected = false
          NetworkManager.getInstance().getEventBus().trigger(EVENTS.opponent_connection_status_changed, {playerId: playerId, isConnected:false})

      #  when a spectator joins the game
      @socket.on 'spectator_joined', (spectatorData,callback)->
        Logger.module("IO").log "NetworkManager::IO:spectator_joined -> #{spectatorData.username}"
        NetworkManager.getInstance().spectators.add(spectatorData)
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.spectator_joined, spectatorData)

      #  when a spectator joins the game
      @socket.on 'spectator_left', (spectatorData,callback)->
        Logger.module("IO").log "NetworkManager::IO:spectator_left -> #{spectatorData.username}"
        NetworkManager.getInstance().spectators.remove(spectatorData.id)
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.spectator_left, spectatorData)

      # when a game error is received
      @socket.on EVENTS.network_game_error, (errorData,callback)->
        Logger.module("IO").warn "NetworkManager::IO:network_game_error -> #{errorData}"
        NetworkManager.getInstance().disconnect()
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.network_game_error, errorData)

      # when a game server error is received
      @socket.on 'game_server_shutdown', (errorData,callback)->
        Logger.module("IO").warn "NetworkManager::IO:game_server_shutdown -> #{errorData.msg}"
        NetworkManager.getInstance().getEventBus().trigger(EVENTS.game_server_shutdown, errorData)

      # when a game close event is received, usually after an error
      @socket.on 'close_game', (callback)->
        Logger.module("IO").warn "NetworkManager::IO:close"
        NetworkManager.getInstance().disconnect()

      # when the socket disconnects
      @socket.on 'disconnect', (err) ->
        console.log(err)
        Logger.module("IO").warn "NetworkManager::IO:disconnect -> DISCONNECT"
        NetworkManager.getInstance().connected = false
        NetworkManager.getInstance().disconnected = true

        TelemetryManager.getInstance().clearSignal("game","connecting")
        TelemetryManager.getInstance().clearSignal("game","in-net-game")

    joinGameRoom: () ->
      Logger.module("SDK").debug "NetworkManager:joinGameRoom"
      if @socket and @socket.connected
        @socket.emit('join_game',
          playerId:@playerId
          gameId:@gameId
        )
      else
        Logger.module("SDK").warn "NetworkManager:joinGameRoom: No socket to emit event!"

    joinGameSpectatorRoom: () ->
      Logger.module("SDK").debug "NetworkManager:joinGameSpectatorRoom"
      if @socket and @socket.connected
        @socket.emit('spectate_game',
          spectatorId: @spectatorId
          spectateToken: @spectateToken
          playerId: @playerId
          gameId: @gameId
        )
      else
        Logger.module("SDK").warn "NetworkManager:joinGameSpectatorRoom: No socket to emit event!"

    # Reconnect helper, call with new address
    reconnect: (newServerAddress) ->
      Logger.module("SDK").debug "NetworkManager:reconnect"
      @socket.io.reconnection(false)
      @socket.disconnect()
      setTimeout(()=>
        @connect(@gameId, @playerId, newServerAddress)
      ,1000)

    disconnect: () ->
      Logger.module("SDK").debug "NetworkManager:disconnect"
      if @connected
        @gameId = null

      if @socket
        # BUG (socket.io) : reconnection(false) doesn't work as expected
        @socket.io.reconnection(false)
        @socket.disconnect()

    broadcastGameEvent: (eventData) ->
      gameSession = GameSession.getInstance()

      # don't broadcast anything if we're a specator or running locally
      if @.spectatorId || gameSession.getIsSpectateMode() || gameSession.getIsRunningAsAuthoritative()
        return false

      validForBroadcast = eventData? and @socket? and @socket.connected and !gameSession.getIsRunningAsAuthoritative()
      if validForBroadcast
        #Logger.module("APPLICATION").log("NetworkManager.broadcastGameEvent", eventData)
        # process data by event type
        type = eventData.type
        if type == EVENTS.step
          step = eventData.step
          # always flag step as transmitted
          transmitted = step.getTransmitted()
          step.setTransmitted(true)
          # steps are only valid when they belong to my player and haven't been transmitted
          validForBroadcast = step? and step.playerId == gameSession.getMyPlayerId() and !transmitted
          if validForBroadcast
            # serialize step in the event data being broadcast
            eventData.step = JSON.parse(gameSession.serializeToJSON(step))

        if validForBroadcast
          @socket.emit EVENTS.network_game_event, eventData, (data) ->
            # TODO: implement the validation on the server
            Logger.module("SDK").debug "NetworkManager.broadcastGameEvent -> validated server got the message"

      return validForBroadcast

  @getInstance: () ->
    instance ?= new _NetworkManager()

module.exports = NetworkManager
