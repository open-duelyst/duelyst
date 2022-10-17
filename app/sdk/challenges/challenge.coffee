EventBus = require 'app/common/eventbus'
EVENTS = require 'app/common/event_types'
UtilsJavascript = require 'app/common/utils/utils_javascript'
GameSession = require 'app/sdk/gameSession'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
GameSetup = require 'app/sdk/gameSetup'
Card = require 'app/sdk/cards/card'
StaticAgent = require 'app/sdk/agents/staticAgent'
DrawStartingHandAction = require 'app/sdk/actions/drawStartingHandAction'
BattleMapTemplate = require 'app/sdk/battleMapTemplate'
i18next = require 'i18next'

class Challenge

  @type: "Challenge"
  type: "Challenge"
  name: "Challenge"
  description: "Learn how to play DUELYST."

  battleMapTemplateIndex: 0 # when set will attempt to force battlemap to a specific template
  _currentInstruction: null
  _currentPlayerTurn: null
  _eventBus:null
  hiddenUIElements:null # array of strings representing unneeded ui elements # TODO: this is just a hacky string checker
  iconUrl: null # path to icon resource
  _instructions:null
  _instructionQueueByTurnIndex:null # Map of instruction queues by player turn index
  isChallengeLost: false # (boolean) Tracks whether the current challenge has been lost (resets on rollback)
  _musicOverride: undefined # (RSX entry) Manual override of the music to play for this map
  _nextInstructionIndex: 0
  _playerOwnedBoardTemplate: undefined # array of arrays that can be filled with unit card ids the player owns at start of challenge
  prerequisiteChallengeTypes: null # list of challenge types that must be completed before this challenge is enabled
  _opponentAgent:null
  _opponentOwnedBoardTemplate: undefined # array of arrays that can be filled with unit card ids the player owns at start of challenge
  otkChallengeFailureCount: null # Integer representing quantity of times otk challenge has been failed
  otkChallengeFailureMessages: null # Array of strings, advances each time challenge has been failed
  otkChallengeStartMessage: null # String to display when starting otk challenge
  requiredMulliganHandIndices: null
  showCardInstructionalTextForTurns: 0 # integer - will show instructional ui on cards for this many turns
  customBoard: true # whether challenge uses a custom board, when true will start board completely empty except for generals
  skipMulligan: true
  snapShotOnPlayerTurn: null
  startingHandSize: null # (Integer, optional) number of cards to have in hand at start of challenge (0-6)
  startingHandSizePlayer: null # (Integer, optional) number of cards to have in player hand at start of challenge (0-6)
  startingHandSizeOpponent: null # (Integer, optional) number of cards to have in opponent hand at start of challenge (0-6)
  startingMana: null # (Integer, optional) starting amount of mana, +1 for player 2
  startingManaPlayer: null # (Integer, optional) starting amount of mana for player, +1 when player 2
  startingManaOpponent: null # (Integer, optional) starting amount of mana for opponent, +1 when player 2
  unmulliganableHandIndices: null
  userIsPlayer1: true
  usesResetTurn: true # (boolean) If true, end turn functionality will be replaced with resetting OTK

  ###*
  # Challenge constructor.
  # @public
  ###
  constructor:()->
    @_eventBus = EventBus.create()
    @_instructions = []
    @hiddenUIElements = ["SignatureCard"]
    @_instructionsByTurnIndex = []
    @_nextInstructionIndex = 0
    @unmulliganableHandIndices = []
    @requiredMulliganHandIndices = []
    @prerequisiteChallengeTypes = []
    @otkChallengeFailureCount = 0

  ###*
   * SDK event handler. Do not call this method manually.
   ###
  onEvent: (event) ->
    if event.type == EVENTS.validate_game_over
      @_onValidateGameOver(event)
    else if event.type == EVENTS.start_turn
      @_onStartTurn(event)

    if @_currentInstruction?
      @_currentInstruction.onEvent(event)

  ###*
  # Get the event bus for this challenge.
  # @public
  ###
  getEventBus:()->
    return @_eventBus

  getType: () ->
    return @type

  getSkipMulligan: () ->
    return @skipMulligan

  ###*
  # Get an array of all the instructions for this challenge.
  # @public
  # @return  {Array}    Array of Instruction objects.
  ###
  getInstructions:()->
    return @_instructions

  ###*
  # Get current instruction for this challenge.
  # @public
  # @return  {Instruction}    Current instruction.
  ###
  getCurrentInstruction:()->
    return @_currentInstruction

  ###*
  # Get opponent agent for this challenge.
  # @public
  # @return  {BaseAgent}    Current instruction.
  ###
  getOpponentAgent:()->
    return @_opponentAgent

  ###*
   * Returns deck data for my player.
   * @param {GameSession} gameSession
   * @returns {Array}
   ###
  getMyPlayerDeckData: (gameSession) ->
    # override in subclass
    return []

  ###*
   * Returns deck data for opponent player
   * @param {GameSession} gameSession
   * @returns {Array}
   ###
  getOpponentPlayerDeckData: (gameSession) ->
    # override in subclass
    return []

  ###*
  # Set up the GameSession for this challenge.
  # @public
  ###
  setupSession:(gameSession, player1Data, player2Data)->
    # set game session challenge
    gameSession.setChallenge(@)

    # set modes
    @setupSessionModes(gameSession)

    # set battlemap template
    if @battleMapTemplateIndex?
      gameSession.setBattleMapTemplate(new BattleMapTemplate(gameSession, @battleMapTemplateIndex))

    # get ids and names
    if @userIsPlayer1
      player1Name = i18next.t("battle.your_name_default_label")
      player2Name = i18next.t("battle.opponent_name_default_label")
      player1Id = gameSession.getUserId()
      player2Id = "CPU"
      player1StartingMana = if @startingManaPlayer? then @startingManaPlayer else if @startingMana? then @startingMana else null
      player2StartingMana = if @startingManaOpponent? then @startingManaOpponent else if @startingMana? then (@startingMana + 1) else null
      player1StartingHandSize = if @startingHandSizePlayer? then @startingHandSizePlayer else @startingHandSize
      player2StartingHandSize = if @startingHandSizeOpponent? then @startingHandSizeOpponent else @startingHandSize
      player1DeckData = @getMyPlayerDeckData(gameSession)
      player2DeckData = @getOpponentPlayerDeckData(gameSession)
    else
      player1Name = i18next.t("battle.opponent_name_default_label")
      player2Name = i18next.t("battle.your_name_default_label")
      player1Id = "CPU"
      player2Id = gameSession.getUserId()
      player1StartingMana = if @startingManaOpponent? then @startingManaOpponent else if @startingMana? then @startingMana else null
      player2StartingMana = if @startingManaPlayer? then @startingManaPlayer else if @startingMana? then (@startingMana + 1) else null
      player1StartingHandSize = if @startingHandSizeOpponent? then @startingHandSizeOpponent else @startingHandSize
      player2StartingHandSize = if @startingHandSizePlayer? then @startingHandSizePlayer else @startingHandSize
      player1DeckData = @getOpponentPlayerDeckData(gameSession)
      player2DeckData = @getMyPlayerDeckData(gameSession)

    # ensure basic player data
    player1Data = UtilsJavascript.fastExtend({
      userId: player1Id
      name: player1Name
      deck: player1DeckData,
      startingHandSize: player1StartingHandSize,
      startingMana: player1StartingMana
    }, player1Data)
    player2Data = UtilsJavascript.fastExtend({
      userId: player2Id
      name: player2Name
      deck: player2DeckData,
      startingHandSize: player2StartingHandSize,
      startingMana: player2StartingMana
    }, player2Data)

    # setup session
    GameSetup.setupNewSession(gameSession, player1Data, player2Data, @customBoard)

    # skip mulligan as needed
    if @skipMulligan
      gameSession.setStatus(GameStatus.active)
      for player in gameSession.players
        player.setHasStartingHand(true)

    # setup board
    @setupBoard(gameSession)

    # setup agent
    @setupOpponentAgent(gameSession)

    # force game session to sync state
    # in case any challenges set custom board state or stats
    gameSession.syncState()

    # snapshot complete session
    @_snapShotChallengeIfNeeded()

    return gameSession

  ###*
   * Sets up the game session modes before creating any game elements.
   * @param {GameSession} gameSession
   ###
  setupSessionModes: (gameSession) ->
    gameSession.setGameType(GameType.Challenge)
    gameSession.setIsRunningAsAuthoritative(true)

  ###*
   * Sets up the board state.
   * @param {GameSession} gameSession
   ###
  setupBoard: (gameSession) ->
    # override in subclass

  ###*
   * Creates the opponent agent.
   * @param {GameSession} gameSession
   ###
  setupOpponentAgent: (gameSession) ->
    # get agent player id
    if @userIsPlayer1
      cpuPlayer = gameSession.getPlayer2()
      cpuPlayerId = cpuPlayer.getPlayerId()
      cpuGeneral = gameSession.getGeneralForPlayer2()
    else
      cpuPlayer = gameSession.getPlayer1()
      cpuPlayerId = cpuPlayer.getPlayerId()
      cpuGeneral = gameSession.getGeneralForPlayer1()

    # create agent
    @_opponentAgent = new StaticAgent(cpuPlayerId)

    # skip agent mulligan
    cpuPlayer.setHasStartingHand(true)

    # tag general
    @_opponentAgent.addUnitWithTag(cpuGeneral, "general")

  ###*
  # Pushes an instruction onto the queue for a turn
  # @param  {Object}  event  event data with format {step:...}
  # @private
  ###
  addInstructionToQueueForTurnIndex:(turnIndex, instruction) ->
    if not @_instructionsByTurnIndex[turnIndex]
      @_instructionsByTurnIndex[turnIndex] = []

    @_instructionsByTurnIndex[turnIndex].push(instruction)


  ##*
  #Activates the next instruction if it's the players turn
  # TODO: Can check here for if the last instruction was completed to allow for instructions that span multiple steps
  #@private
  ##
  activateNextInstruction:()->
    if @_currentInstruction
      @_currentInstruction = null

    if !GameSession.current().isMyTurn()
      return

    # Get the player turn index
    currentTurnIndex = GameSession.current().getNumberOfTurns() # current turn count calculation is ugly
    playersTurnIndex = Math.floor(currentTurnIndex / 2) # represents the index of turn for this player

    # check for a new turn
    if !@_currentPlayerTurn? or @_currentPlayerTurn != playersTurnIndex
      @_currentPlayerTurn = playersTurnIndex
      @_nextInstructionIndex = 0

    nextInstruction = @_instructionsByTurnIndex[playersTurnIndex]?[@_nextInstructionIndex]

    if nextInstruction
      @_currentInstruction = nextInstruction
      @_eventBus.trigger(EVENTS.instruction_triggered, {type: EVENTS.instruction_triggered, instruction:nextInstruction})
      @_nextInstructionIndex++

  hasInstructionForGameTurn: (gameTurnIndex) ->
    playersTurnIndex = Math.floor(gameTurnIndex / 2) # represents the index of turn for this player
    return @_instructionsByTurnIndex[playersTurnIndex]?

  _onStartTurn: (e) ->
    @_snapShotChallengeIfNeeded()

  _snapShotChallengeIfNeeded: () ->
    if @snapShotOnPlayerTurn? and GameSession.current().getCurrentPlayerId() == GameSession.current().getMyPlayerId()
      # Get the player turn index
      currentTurnIndex = GameSession.current().getNumberOfTurns() # current turn count calculation is ugly
      playersTurnIndex = Math.floor(currentTurnIndex / 2) # represents the index of turn for this player

      if playersTurnIndex == @snapShotOnPlayerTurn and !@_snapShotData
        gameSession = GameSession.current()
        @_snapShotData = gameSession.serializeToJSON(gameSession)
        @_eventBus.trigger(EVENTS.challenge_start, {type: EVENTS.challenge_start})

  _onValidateGameOver:()->
    gameSession = GameSession.current()
    myGeneral = gameSession.getGeneralForPlayerId(gameSession.getMyPlayerId())

    if @snapShotOnPlayerTurn? and myGeneral.getIsRemoved()
      # set general as not removed so that game does not end
      myGeneral.setIsRemoved(false)

      # trigger challenge loss
      @onChallengeLost()

  onChallengeLost: () ->
    # record loss
    @otkChallengeFailureCount++
    @isChallengeLost = true

    # trigger challenge lost event
    @_eventBus.trigger(EVENTS.challenge_lost, {type: EVENTS.challenge_lost, needsRollback:true})

  challengeReset: () ->
    # trigger challenge loss
    @onChallengeLost()

    # trigger challenge reset event
    @_eventBus.trigger(EVENTS.challenge_reset, {type: EVENTS.challenge_reset})

  challengeRollback: () ->
    gameSession = GameSession.current()
    gameSession._rollbackToSnapshot(@_snapShotData)
    # Reset opponent agents action sequence
    this._opponentAgent.currentTurnIndex = undefined
    this._opponentAgent.currentActionIndexInTurn = 0
    @isChallengeLost = false

  applyCardToBoard: (cardOrCardData, boardX, boardY, ownerId) ->
    gameSession = GameSession.getInstance()

    # create card as needed
    if !(cardOrCardData instanceof Card)
      cardOrCardData = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardOrCardData)

    # apply card
    if cardOrCardData?
      if ownerId? then cardOrCardData.setOwnerId(ownerId)

      gameSession.applyCardToBoard(cardOrCardData, boardX, boardY)

      if cardOrCardData.refreshExhaustion
        cardOrCardData.refreshExhaustion()

      return cardOrCardData


module.exports = Challenge
