#_ = require 'underscore'

PlayCardFromHandAction = require "app/sdk/actions/playCardFromHandAction"
PlayCardAction = require "app/sdk/actions/playCardAction"
ApplyCardToBoardAction = require "app/sdk/actions/applyCardToBoardAction"
GameSession = require "app/sdk/gameSession"
CONFIG = require "app/common/config"

###
AgentActions - Creates agent style actions and later interprets them into sdk actions
- Factory class
###

class AgentActions
  # Hard actions
  @_moveUnitType: "MoveUnit"
  @_attackActionType: "AttackWithUnit"
  @_playCardActionType: "PlayCard"
  @_playCardFindPositionActionType: "PlayCardFindPosition"
  @_playFollowupActionType: "PlayFollowup"

  # Soft Actions
  @_tagUnitActionType: "TagUnit"
  @_speechActionType: "Speech"
  @_instructionActionType: "Instruction"
  @_delayActionType: "Delay"
  @_showInstructionLabelsActionType: "ShowInstructionLabels"

  ###*
  # @param {string} type - Type of
  ###
  @_createBaseAgentAction: (type) ->
    return {type: type}

  ###*
  # @param {string} unitTag - tag of the unit to perform this action with
  ###
  @_createBaseSoftAgentAction: (softActionType) ->
    softAgentAction = @_createBaseAgentAction(softActionType)
    softAgentAction.isSoft = true
    return softAgentAction


  ###*
  # @param {string} unitTag - tag of the unit to perform this action with
  # @param {object} deltaXY- object with X and Y delta for the movement the unit should take
  ###
  @createAgentActionMoveUnit: (unitTag, deltaXY) ->
    agentAction = @_createBaseAgentAction(@_moveUnitType)
    agentAction.unitTag = unitTag
    agentAction.deltaXY = deltaXY
    return agentAction


  ###*
  # @param {string} unitTag - tag of the unit to perform this action with
  # @param {object} attackTargetPosition - object with X and Y delta for the movement the unit should take
  # @param {object} targetPositionIsAbsolute - (optional) flag for whether the attack position should be a delta from attacker or absolute position
  ###
  @createAgentActionAttackWithUnit: (unitTag, attackTargetPosition, targetPositionIsAbsolute=true) ->
    agentAction = @_createBaseAgentAction(@_attackActionType)
    agentAction.unitTag = unitTag
    agentAction.attackTargetPosition = attackTargetPosition
    agentAction.targetPositionIsAbsolute = targetPositionIsAbsolute
    return agentAction


  @createAgentActionPlayCard: (handIndex, targetPosition) ->
    agentAction = @_createBaseAgentAction(@_playCardActionType)
    agentAction.handIndex = handIndex
    agentAction.targetPosition = targetPosition
    return agentAction

  @createAgentActionPlayCardFindPosition: (handIndex, positionFilter) ->
    agentAction = @_createBaseAgentAction(@_playCardFindPositionActionType)
    agentAction.handIndex = handIndex
    agentAction.positionFilter = positionFilter
    return agentAction


  @createAgentActionPlayFollowup: (followupCardId, sourcePosition, targetPosition) ->
    agentAction = @_createBaseAgentAction(@_playFollowupActionType)
    agentAction.followupCardId = followupCardId
    agentAction.sourcePosition = sourcePosition
    agentAction.targetPosition = targetPosition
    return agentAction


  @createSDKActionFromAgentAction: (agent, agentAction) ->
    gameSession = GameSession.current()
    if agentAction.type == @_moveUnitType
      unit = agent.getUnitForTag(gameSession,agentAction.unitTag)
      targetPosition = unit.getPosition()
      targetPosition.x += agentAction.deltaXY.x
      targetPosition.y += agentAction.deltaXY.y
      return unit.actionMove(targetPosition)
    else if agentAction.type == @_attackActionType
      unit = agent.getUnitForTag(gameSession,agentAction.unitTag)
      targetPosition = {x: agentAction.attackTargetPosition.x, y: agentAction.attackTargetPosition.y}
      if !agentAction.targetPositionIsAbsolute
        targetPosition.x += unit.getPositionX()
        targetPosition.y += unit.getPositionY()
      return unit.actionAttackEntityAtPosition(targetPosition)
    else if agentAction.type == @_playCardActionType
      return new PlayCardFromHandAction(gameSession,gameSession.getCurrentPlayerId(),agentAction.targetPosition.x,agentAction.targetPosition.y,agentAction.handIndex)
    else if agentAction.type == @_playFollowupActionType
      playCardAction = new PlayCardAction(gameSession,gameSession.getCurrentPlayerId(),agentAction.targetPosition.x,agentAction.targetPosition.y,{id: agentAction.followupCardId})
      playCardAction.sourcePosition = {x: agentAction.sourcePosition.x, y: agentAction.sourcePosition.y}
      return playCardAction
    else if agentAction.type == @_playCardFindPositionActionType
      possiblePositions = agentAction.positionFilter()
      targetPosition = possiblePositions[0]
      return new PlayCardFromHandAction(gameSession,gameSession.getCurrentPlayerId(),targetPosition.x,targetPosition.y,agentAction.handIndex)
    else
      throw new Error("Unexpected AgentAction type: #{agentAction.type}")

  @createAgentSoftActionTagUnitAtPosition: (unitTag, position) ->
    agentSoftAction = @_createBaseSoftAgentAction(@_tagUnitActionType)
    agentSoftAction.unitTag = unitTag
    agentSoftAction.position = position
    return agentSoftAction

  @createAgentSoftActionShowInstructionLabels: (instructionLabels) ->
    agentSoftAction = @_createBaseSoftAgentAction(@_showInstructionLabelsActionType)
    agentSoftAction.instructionLabels = instructionLabels
    return agentSoftAction

  @executeSoftActionForAgent: (agent, agentSoftAction) ->
    gameSession = GameSession.current()
    if agentSoftAction.type == @_tagUnitActionType
      unitAtPosition = gameSession.getBoard().getUnitAtPosition(agentSoftAction.position,true,true)
      agent.addUnitWithTag(unitAtPosition,agentSoftAction.unitTag)



module.exports = AgentActions
