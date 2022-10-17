CONFIG =       require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
Logger =       require 'app/common/logger'

_ = require 'underscore'
GameSession = require 'app/sdk/gameSession'
BaseAgent = require './baseAgent'
AgentActions = require './agentActions'
Step = require 'app/sdk/step'

###
StaticAgent - Takes a set of actions it's supposed to execute at a certain step index
###


class StaticAgent extends BaseAgent
  name: "StaticAgent"
  actionsByTurn: null # Map of turn indices to arrays containing the steps to be executed in order on that turn
  currentTurnIndex: undefined # players turn index, so it goes by 0,1,2,... instead of 0,2,4,6 like sdk turns would
  currentActionIndexInTurn: undefined # index into the agent actions for the current turn this agent is currently on
  delayBetweenActions: 0 # milliseconds between agent firing actions
  currentActions: undefined # array of actions to be taken, an empty array means end turn

  ###*
  # ReactiveAgent constructor.
  # @public
  ###
  constructor:(playerId)->
    super(playerId)
    @actionsByTurn = {}
    @currentTurnIndex = 0
    @currentActionIndexInTurn = 0
    @currentActions = undefined

  ###*
  # _reactToGameStep
  # @param  {integer} turnIndex - index of turn this action is supposed to occur in
  # @param  {Object} agentAction - agentAction this agent is supposed to execute
  ###
  addActionForTurn:(turnIndex,agentAction) ->
    if !agentAction
      throw new Error("StaticAgent:addActionForTurn - Attempted to add faulty action")

    if not @actionsByTurn[turnIndex]
      @actionsByTurn[turnIndex] = []

    @actionsByTurn[turnIndex].push(agentAction)


  ###*
  # gatherAgentActionSequenceAfterStep - builds the queue of actions to take after this step
  # @param  {Step Object} lastStep - Last step shown by GameLayer - if null, this is first step in game
  ###
  gatherAgentActionSequenceAfterStep: (lastStep) ->
    @currentSpeechActions = []
    @currentInstructionActions = []


    gameSession = GameSession.current()
    # Static doesn't track or perform anything during opponents turn
    if gameSession.getCurrentPlayerId() != @playerId
      return

    # TODO: there is no delay for showing end of turn so add a small delay to first action

    # It's agent's turn proceed to execute
    currentTurnIndex = gameSession.getNumberOfTurns() # current turn count calculation is ugly
    playersTurnIndex = Math.floor(currentTurnIndex / 2) # represents the index of turn for this player
    actionsForThisTurn = @actionsByTurn[playersTurnIndex]

    # check if we're in a new turn
    if @currentTurnIndex != playersTurnIndex
      Logger.module("Agent").log("Detected start of new turn: #{playersTurnIndex}")
      @currentTurnIndex = playersTurnIndex
      @currentActionIndexInTurn = 0

    this.currentActions = []
    # Gather any soft actions
    keepScanningForSoftActions = true
    while keepScanningForSoftActions
      keepScanningForSoftActions = false

      # check that we're not out of actions
      if actionsForThisTurn and @currentActionIndexInTurn < actionsForThisTurn.length
        currentAction = actionsForThisTurn[@currentActionIndexInTurn]
        if currentAction.isSoft
          AgentActions.executeSoftActionForAgent(@,currentAction)
          this.currentActions.push(currentAction)
          @currentActionIndexInTurn++
          keepScanningForSoftActions = true

    # if there are no actions for this turn or we have done all actions in this turn go ahead and end the turn
    if !actionsForThisTurn or @currentActionIndexInTurn >= actionsForThisTurn.length
      # end turn is assumed if there is no hard action at the end of action list
      return

    # grab the action we're supposed to execute
    agentActionToExecute = actionsForThisTurn[@currentActionIndexInTurn]
    this.currentActions.push(agentActionToExecute)

    # iterate current action index
    @currentActionIndexInTurn++


module.exports = StaticAgent
