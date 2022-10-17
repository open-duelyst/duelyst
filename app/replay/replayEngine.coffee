###
ReplayEngine - Drives the application through the replay of a game
why is code organized in this weird fashion? check: https://coderwall.com/p/myzvmg
###
class ReplayEngine

  instance = null

  @create: () ->
    return new _ReplayEngine()

  @getInstance: () ->
    instance ?= new _ReplayEngine()

  # alias of "getInstance"
  @current: () ->
    instance ?= new _ReplayEngine()

  @reset: () ->
    if instance? then instance.terminate()
    instance = null

module.exports = ReplayEngine

SDK = require 'app/sdk'
Scene = require 'app/view/Scene'
EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
NavigationManager = require "app/ui/managers/navigation_manager"

class _ReplayEngine

  _currentTurnIndex: null # index of current turn being replayed
  _currentStepIndex: null # index of current step into current turn being replayed
  _currentDeserializedStep: null
  _currentStepStartedAt: null
  _currentStepTimestamp: null
  _currentStepDelay: null
  _currentStepDelayBase: null
  _currentStepDelayClamped: null
  _currentStepDelayCulled: null
  _currentStepDelayScale: null
  _currentUIEventIndex: 0
  _currentUIEventStartedAt: null
  _currentUIEventDelay: null
  _gameSessionData: null # Parsed gamesession data
  _gameUIEventData: null # Array of hover, select, etc data
  _isPlaying: false # whether replay is playing or paused
  _isCullingDeadtimeBeforePause: false # whether replay is culling deadtime as of pause
  _opponentStepBuffer: null
  _pausedAt: null
  _replayGameId: null # game id for active replay
  _turns: null # Collection of all turns from parsed data (including current turn)

  constructor: () ->
    @_eventBus = EventBus.create()

  ###*
   * Returns the event bus where all events are piped through.
    ###
  getEventBus: () ->
    return @_eventBus

  # region START / STOP

  ###*
  # Start a game replay from game session data and optionally mouse/ui event data.
  # @public
  # @param  {Object} gameSessionData  game data to replay
  # @param  {Array}  [gameUIEventData=null] array of mouse/ui event data
  # @return  {Promise} Promise that will resolve after replay starts.
  ###
  watchReplay: (gameSessionData, gameUIEventData) ->
    if @_replayGameId?
      throw new Error("Cannot replay game during existing replay!")

    if !gameSessionData?
      throw new Error("Cannot replay game without game data!")

    @_replayGameId = gameSessionData.gameId
    @_gameSessionData = gameSessionData
    @_gameUIEventData = gameUIEventData
    @_isPlaying = true
    Logger.module("REPLAY").debug "watchReplay #{@_replayGameId}"

    # listen for exit to allow cancelling out of replay
    NavigationManager.getInstance().on(EVENTS.user_triggered_exit, @stopCurrentReplay, @)

    # get all turns
    @_turns = @_gameSessionData.turns.slice(0)

    # the current turn may already have been added to the list of turns
    # in the case of when the game ended as the turn ended
    currentTurn = @_gameSessionData.currentTurn
    needsCurrentTurn = true
    for turn in @_turns
      if currentTurn.createdAt == turn.createdAt
        needsCurrentTurn = false
        break

    if needsCurrentTurn
      @_turns.push(currentTurn)

    @_currentTurnIndex = 0
    @_currentStepIndex = 0
    @_currentStepStartedAt = null
    @_currentDeserializedStep = null
    @_opponentStepBuffer = []
    @_currentStepTimestamp = null
    @_currentStepDelay = null
    @_currentStepDelayBase = null
    @_currentStepDelayClamped = null
    @_currentStepDelayCulled = null
    @_currentStepDelayScale = 1.0

    @_currentUIEventIndex = 0
    @_currentUIEventStartedAt = null
    @_currentUIEventDelay = null

    @_pausedAt = null
    @_isCullingDeadtimeBeforePause = false

    # emit event that replay has started
    @_eventBus.trigger(EVENTS.replay_started)

    # short delay then start
    @_startTimeoutId = setTimeout((() ->
      @_startTimeoutId = null

      # start replaying steps
      @_startReplayingSteps()

      # schedule first UI event
      @_startReplayingUIEvents()
    ).bind(@), 2000.0)

  stopCurrentReplay: () ->
    Logger.module("REPLAY").debug "stopCurrentReplay #{@_replayGameId}"
    if @_replayGameId?
      # reset replay data
      @_replayGameId = null
      @_isPlaying = false
      @_gameSessionData = null
      @_gameUIEventData = null
      @_currentDeserializedStep = null
      @_opponentStepBuffer = null

      # end all timeouts
      @_clearTimeouts()

      # stop listening to events
      NavigationManager.getInstance().off(EVENTS.user_triggered_exit, @stopCurrentReplay, @)

      # emit event that replay has stopped
      @_eventBus.trigger(EVENTS.replay_stopped)

  isPlaying: ()->
    return @_isPlaying

  # endregion START / STOP

  # region PAUSE / RESUME

  togglePause: ()->
    if @_isPlaying
      @.pause()
    else
      @.resume()

  pause: ()->
    if @_replayGameId? and @_gameSessionData? and @_isPlaying
      Logger.module("REPLAY").log "pause replay"
      # pause replay
      @_isPlaying = false
      @_isCullingDeadtimeBeforePause = CONFIG.replaysCullDeadtime
      @_clearTimeouts()

      # record time paused at
      @_pausedAt = Date.now()

      # emit event that replay has paused
      @_eventBus.trigger(EVENTS.replay_paused)

  resume: ()->
    if @_replayGameId? and @_gameSessionData? and !@_isPlaying
      Logger.module("REPLAY").log "resume replay"

      # adjust step time if deadtime culling has changed
      if @_isCullingDeadtimeBeforePause != CONFIG.replaysCullDeadtime
        @_updateStepTimeForDeadtimeCulling()

      # resume replay
      @_isPlaying = true
      @_startReplayingSteps()
      @_startReplayingUIEvents()

      # clear pause data
      @_pausedAt = null
      @_isCullingDeadtimeBeforePause = null

      # emit event that replay has resumed
      @_eventBus.trigger(EVENTS.replay_resumed)

  updateTimeForPlayingStep: () ->
    if @_isPlaying
      Logger.module("REPLAY").log "updateTimeForPlayingStep"
      @_clearTimeouts()

      # record time paused at
      @_pausedAt = Date.now()

      # adjust step time
      @_updateStepTimeForDeadtimeCulling()

      # restart playing steps
      @_startReplayingSteps()
      @_startReplayingUIEvents()

      # clear pause data
      @_pausedAt = null

  _updateStepTimeForDeadtimeCulling: () ->
    if @_currentStepDelay?
      if !CONFIG.replaysCullDeadtime
        @_currentStepDelayClamped = @_currentStepDelayBase
      else
        @_currentStepDelayClamped = Math.min(@_currentStepDelayCulled, @_currentStepDelayBase)
      @_currentStepDelayScale = @_currentStepDelayClamped / @_currentStepDelayBase
      @_currentStepDelay = @_currentStepDelayClamped / CONFIG.replayActionSpeedModifier

  # endregion PAUSE / RESUME

  # region REPLAY

  _clearTimeouts: () ->
    @_clearStartTimeout()
    @_clearStepTimeout()
    @_clearUIEventTimeout()

  _clearStartTimeout: () ->
    if @_startTimeoutId?
      clearTimeout(@_startTimeoutId)
      @_startTimeoutId = null

  _clearStepTimeout: () ->
    if @_currentStepTimeoutId?
      clearTimeout(@_currentStepTimeoutId)
      @_currentStepTimeoutId = null

  _clearUIEventTimeout: () ->
    if @_currentUIEventTimeoutId?
      clearTimeout(@_currentUIEventTimeoutId)
      @_currentUIEventTimeoutId = null

  _startReplayingSteps: () ->
    if !@_replayGameId? or !@_isPlaying or !@_gameSessionData?
      return

    currentTurn = @_turns[@_currentTurnIndex]
    currentStep = currentTurn?.steps[@_currentStepIndex]
    if currentStep?
      if @_pausedAt? and @_currentStepStartedAt?
        delay = @_currentStepDelay - (@_pausedAt - @_currentStepStartedAt)
        delayBase = delay
        #Logger.module("REPLAY").log("_startReplayingSteps -> resume paused at", @_pausedAt, "timestamp", @_currentStepStartedAt, "original delay", @_currentStepDelay, "delay", delay)
      else
        delayBase = currentStep.timestamp - @_gameSessionData.createdAt
        delay = CONFIG.REPLAY_MAX_STEP_DELAY_STARTING_HAND * 1000.0
        #Logger.module("REPLAY").log("_startReplayingSteps -> start at", @_gameSessionData.createdAt, "timestamp", currentStep.timestamp, "delay", delay)

      if delay?
        delay = Math.max(0.0, delay)
        @_currentStepTimestamp = currentStep.timestamp
        @_currentStepStartedAt = Date.now()

        # skip any delays on opponent mulligan and execute immediately
        if SDK.GameSession.getInstance().isNew() and currentStep.playerId == SDK.GameSession.getInstance().getOpponentPlayerId()
          @_currentStepDelayBase = @_currentStepDelayCulled = @_currentStepDelayClamped = @_currentStepDelay = 0.0
          @_currentStepDelayScale = 1.0
          @_replayNextStep()
        else
          @_currentStepDelayBase = delayBase
          @_currentStepDelayCulled = delay
          if !CONFIG.replaysCullDeadtime
            @_currentStepDelayClamped = @_currentStepDelayBase
          else
            @_currentStepDelayClamped = Math.min(@_currentStepDelayCulled, @_currentStepDelayBase)
          @_currentStepDelayScale = @_currentStepDelayClamped / @_currentStepDelayBase
          @_currentStepDelay = @_currentStepDelayClamped / CONFIG.replayActionSpeedModifier
          @_currentStepTimeoutId = setTimeout(@_replayNextStep.bind(@), @_currentStepDelay)

  _replayNextStep: () ->
    if !@_replayGameId? or !@_isPlaying or !@_gameSessionData?
      return

    @_clearStepTimeout()

    # show current step
    currentTurnIndex = @_currentTurnIndex
    currentStepIndex = @_currentStepIndex
    currentTurn = @_turns[currentTurnIndex]
    currentStep = currentTurn?.steps[currentStepIndex]
    if !@_currentDeserializedStep? and currentStep?
      @_currentDeserializedStep = SDK.GameSession.getInstance().deserializeStepFromFirebase(currentStep)
    currentDeserializedStep = @_currentDeserializedStep
    if currentDeserializedStep?
      @_currentStepTimestamp = currentDeserializedStep.timestamp
      @_currentStepStartedAt = Date.now()

      # increment step/turn counters
      @_currentStepIndex++
      if @_currentStepIndex >= currentTurn.steps.length
        @_currentStepIndex = 0
        @_currentTurnIndex++
      #Logger.module("REPLAY").log("_replayNextStep -> turn index #{@_currentTurnIndex} step index #{@_currentStepIndex} action #{currentDeserializedStep.action.type}")
      # get next step/turn
      nextTurnIndex = @_currentTurnIndex
      nextStepIndex = @_currentStepIndex
      nextTurn = @_turns[nextTurnIndex]
      nextStep = nextTurn?.steps[nextStepIndex]
      if nextStep?
        nextDeserializedStep = SDK.GameSession.getInstance().deserializeStepFromFirebase(nextStep)
      nextAction = nextDeserializedStep?.action

      # buffer steps in opponent followup chain until final step
      currentAction = currentDeserializedStep.action
      canBuffer = nextAction? and currentDeserializedStep.playerId == SDK.GameSession.getInstance().getOpponentPlayerId() and !(nextAction instanceof SDK.PlayCardFromHandAction) and nextAction instanceof SDK.ApplyCardToBoardAction
      shouldBuffer = canBuffer and currentAction instanceof SDK.ApplyCardToBoardAction and currentAction.getCard()?.getCurrentFollowup()?
      if shouldBuffer
        @_opponentStepBuffer.push(currentDeserializedStep)
      else
        # execute buffered steps
        if @_opponentStepBuffer.length > 0
          opponentStepBuffer = @_opponentStepBuffer
          @_opponentStepBuffer = []
          for bufferedStep in opponentStepBuffer
            SDK.GameSession.getInstance().executeAuthoritativeStep(bufferedStep)

        # execute step
        SDK.GameSession.getInstance().executeAuthoritativeStep(currentDeserializedStep)

      if nextDeserializedStep?
        # set next deserialized step as current
        @_currentDeserializedStep = nextDeserializedStep

        # skip any delays on opponent mulligan and execute immediately
        if SDK.GameSession.getInstance().isNew() and nextStep.playerId == SDK.GameSession.getInstance().getOpponentPlayerId()
          @_currentStepDelayBase = @_currentStepDelayCulled = @_currentStepDelayClamped = @_currentStepDelay = 0.0
          @_currentStepDelayScale = 1.0
          @_replayNextStep()
        else
          # delay and show next step
          delay = Math.max(0.0, nextDeserializedStep.timestamp - @_currentStepTimestamp)
          @_currentStepDelayBase = delay
          if SDK.GameSession.getInstance().isNew()
            @_currentStepDelayCulled = CONFIG.REPLAY_MAX_STEP_DELAY_STARTING_HAND * 1000.0
          else
            @_currentStepDelayCulled = CONFIG.REPLAY_MAX_STEP_DELAY * 1000.0
          if !CONFIG.replaysCullDeadtime
            @_currentStepDelayClamped = @_currentStepDelayBase
          else
            @_currentStepDelayClamped = Math.min(@_currentStepDelayBase, @_currentStepDelayCulled)
          if @_currentStepDelayClamped > 0.0 && @_currentStepDelayClamped < @_currentStepDelayBase
            @_currentStepDelayScale = @_currentStepDelayClamped / @_currentStepDelayBase
          else
            @_currentStepDelayScale = 1.0
          @_currentStepDelay = @_currentStepDelayClamped / CONFIG.replayActionSpeedModifier
          #Logger.module("REPLAY").log("_replayNextStep -> next #{nextAction.type} delay #{@_currentStepDelay} base #{@_currentStepDelayBase} clamped #{@_currentStepDelayClamped} scale #{@_currentStepDelayScale}")
          @_currentStepTimeoutId = setTimeout(@_replayNextStep.bind(@), @_currentStepDelayClamped)
      else
        @stopCurrentReplay()
    else
      @stopCurrentReplay()

  _startReplayingUIEvents: () ->
    if !@_replayGameId? or !@_isPlaying or !@_gameUIEventData? or @_gameUIEventData.length == 0
      return

    eventData = @_gameUIEventData[@_currentUIEventIndex]
    now = Date.now()

    if @_pausedAt?
      delay = @_currentUIEventDelay - (@_pausedAt - @_currentUIEventStartedAt)
      #Logger.module("REPLAY").log("_startReplayingUIEvents -> resume paused at", @_pausedAt, "timestamp", @_currentUIEventStartedAt, "original delay", @_currentUIEventDelay, "delay", delay)
    else
      timeSinceStep = now - @_currentStepStartedAt
      if @_currentStepTimestamp > eventData.timestamp
        timeToStep = @_currentStepTimestamp - eventData.timestamp
        delay = @_currentStepDelay - timeSinceStep - timeToStep * @_currentStepDelayScale
        #Logger.module("REPLAY").log("_startReplayingUIEvents -> #{eventData.type} before step delay", delay)
      else
        timeFromStep = eventData.timestamp - @_currentStepTimestamp
        delay = timeFromStep * @_currentStepDelayScale - timeSinceStep
        #Logger.module("REPLAY").log("_startReplayingUIEvents -> #{eventData.type} from step delay", delay)

    if delay?
      @_currentUIEventStartedAt = now
      if delay <= 0.0
        @_currentUIEventDelay = 0.0
        @_replayNextUIEvent()
      else
        @_currentUIEventDelay = delay
        @_currentUIEventTimeoutId = setTimeout(@_replayNextUIEvent.bind(@), @_currentUIEventDelay)

  _replayNextUIEvent: ()->
    if !@_replayGameId? or !@_isPlaying or !@_gameUIEventData? or @_gameUIEventData.length == 0
      return

    @_clearUIEventTimeout()

    if @_currentUIEventIndex < @._gameUIEventData.length
      # show current UI event
      eventData = @_gameUIEventData[@_currentUIEventIndex]
      if eventData?
        #Logger.module("REPLAY").log("_replayNextUIEvent -> current #{eventData.type}", eventData)
        # play current event
        if (eventData.type == EVENTS.network_game_hover)
          Scene.getInstance().getGameLayer()?.onNetworkHover(eventData)
        else if (eventData.type == EVENTS.network_game_select)
          Scene.getInstance().getGameLayer()?.onNetworkSelect(eventData)
        else if (eventData.type == EVENTS.network_game_mouse_clear)
          Scene.getInstance().getGameLayer()?.onNetworkMouseClear(eventData)
        else if (eventData.type == EVENTS.turn_time)
          SDK.GameSession.getInstance().setTurnTimeRemaining(eventData.time)
        else if (eventData.type == EVENTS.show_emote)
          EventBus.getInstance().trigger(EVENTS.show_emote, eventData)

        # increment counter
        @_currentUIEventIndex++

        # delay and show next UI event
        nextEventData = @_gameUIEventData[@_currentUIEventIndex]
        if nextEventData?
          @_currentUIEventStartedAt = Date.now()
          timeSinceStep = @_currentUIEventStartedAt - @_currentStepStartedAt
          if @_currentStepTimestamp > nextEventData.timestamp
            timeToStep = @_currentStepTimestamp - nextEventData.timestamp
            delay = @_currentStepDelay - timeSinceStep - timeToStep * @_currentStepDelayScale
            #Logger.module("REPLAY").log("_replayNextUIEvent -> next #{nextEventData.type} before step delay", delay)
          else
            timeFromStep = nextEventData.timestamp - @_currentStepTimestamp
            delay = timeFromStep * @_currentStepDelayScale - timeSinceStep
            #Logger.module("REPLAY").log("_replayNextUIEvent -> next #{nextEventData.type} from step delay", delay)
          if delay <= 0.0
            #Logger.module("REPLAY").log("_replayNextUIEvent -> next #{nextEventData.type} instant")
            @_currentUIEventDelay = 0.0
            @_replayNextUIEvent()
          else
            @_currentUIEventDelay = delay / CONFIG.replayActionSpeedModifier
            #Logger.module("REPLAY").log("_replayNextUIEvent -> next #{nextEventData.type} delay #{@_currentUIEventDelay}")
            @_currentUIEventTimeoutId = setTimeout(@_replayNextUIEvent.bind(@), @_currentUIEventDelay)

  # endregion REPLAY
