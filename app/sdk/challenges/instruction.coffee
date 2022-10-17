CONFIG = require("app/common/config")
UtilsJavascript = require("app/common/utils/utils_javascript")
Validator = require("./../validators/validator")
EndTurnAction = require("app/sdk/actions/endTurnAction")
_ = require('underscore')
i18next = require('i18next')

class Instruction extends Validator

  type:"Instruction"
  @type:"Instruction"

  triggerStepIndex:null

  isComplete:false
  failedLabel:"Invalid move"
  showFailureOnSource: false # whether to show failure label on source or target position
  sourcePosition:null # Required source tile x-y indices
  targetPosition:null # Required target tile x-y indices
  handIndex:null # Required hand index
  instructionArrowPositions:null # optional array of positions to drop instructional arrows at start of instruction
  persistentInstructionArrowPosition:null # optional x-y tile index of where to place a persistent instruction arrow
  preventSelectionUntilLabelIndex: null # optional integer, whether or not to prevent my player from selecting units until the label at this index plays
  disableReadiness: false # optional boolean, disables readiness indicators on units (this may grow into filtering and applying visual tags)
  generalSpeech: null #optional string of general speech
  generalSpeechYPosition: null # optional y descriptor for positioning general speech

  # TODO: Convert into a class
  # array of objects containing 2 or more values
  # - label {string}
  # - position {object} - tile indices
  # - positionAtHandIndex {integer} - hand index to display at
  # - positionAtManaIndex {integer} - mana index to point to
  # - positionAtMyHealth {boolean} - whether to position at my health
  # - positionAtEnemyHealth {boolean} - whether to position at enemy health
  # - positionAtEndTurn {boolean} - whether to position at the end turn button
  # - positionAtPlayerArtifactIndex {ineger} - positions label at one of player's artifacts (0 1 or 2)
  # - positionAtReplace {boolean} - whether to position at replace node
  # - positionAtSignatureSpell {boolean} - whether to position at player's signature spell node
  # - duration {optional, number}
  # - delay {optional, number} seconds to delay before showing this message
  # - instructionArrowPositions {optional, array of positions} - places to drop an instructional arrow at start of instruction label
  # - isPersistent {optional, boolean} - whether or not this exits on it's own or waits for an interaction to continue sequence
  # - isNotDismissable {optional, boolean} - whether or not this instruction can be clicked to skip (defaults to false)
  # - triggersInstructionIndex {optional, integer} - which instruction label to play after this one completes, defaults to the next instruction (or itself if last)
  # instruction label focus directions:
  # - focusUp: {optional, boolean} - direction this instruction should focus, defaults to false which means focusDown
  # - focusDown: {optional, boolean} - direction this instruction should focus, defaults to false which means focusDown
  # - focusLeft: {optional, boolean} - direction this instruction should focus, defaults to false which means focusDown
  # - focusRight: {optional, boolean} - direction this instruction should focus, defaults to false which means focusDown
  # Speech label options
  # - isSpeech {boolean} - true to activate this as a general speech node instead of instruction node
  # - yPosition {Number} - percentage up the screen for speech to come in from
  # - isOpponent {boolean} - optional - defaults to false, if true
  instructionLabels: null # array of objects with the options described above

  expectedActionType:null

  ###*
  # Instruction constructor.
  # @param  {Object}  params  Parameters that will get copied into this object to override the default properties.
  # @public
  ###
  constructor:(params)->
    super()

    UtilsJavascript.fastExtend(this,params)

  ###*
  # Check if a specified board position is valid as this instruction's source position.
  # @param  {Point}  p  Position to compare with source.
  # @public
  ###
  isValidSourcePosition:(p)->
    return !@.sourcePosition? or (p.x == @.sourcePosition.x and p.y == @.sourcePosition.y)

  ###*
  # Check if a specified board position is valid as this instruction's target position.
  # @param  {Point}  p  Position to compare with target.
  # @public
  ###
  isValidTargetPosition:(p)->
    return !@.targetPosition? or (p.x == @.targetPosition.x and p.y == @.targetPosition.y)

  ###*
  # Check if a specified hand index is valid as this instruction's required hand index
  # @param  {integer}  handIndex  handIndex to compare with required handIndex of instruction
  # @public
  ###
  isValidHandIndex:(handIndex)->
    return !@handIndex? or (@handIndex == handIndex)

  ###*
  # Called when an action is executed on the .
  # @param  {Point}  p  Position to compare with target.
  # @public
  ###
  onValidateAction:(e)->
    super(e)
    action = e.action
    if action? and action.getIsValid() and !action.getIsImplicit() and !action.getIsAutomatic()
      if action.type == @.expectedActionType and @.isValidTargetPosition(action.targetPosition) and @.isValidSourcePosition(action.sourcePosition) and @isValidHandIndex(action.indexOfCardInHand)
        action.setIsValid(true)
      else
        @.invalidateAction(action, @_getFailureMessagePosition(), @.failedLabel)

  _getFailureMessagePosition: () ->
    # first rely on the existence of source position, defaults to target position of no source
    if !@sourcePosition
      return @targetPosition

    if @showFailureOnSource
      return @sourcePosition
    else
      return @targetPosition

  @createEndTurnInstruction:()->
    endTurnInstruction = new Instruction(
#      failedLabel:"Click Here."
      failedLabel:i18next.t("tutorial.end_your_turn_message")
      expectedActionType:EndTurnAction.type
      instructionLabels:[
        label:i18next.t("tutorial.end_your_turn_message")
        positionAtEndTurn:true
        triggersInstructionIndex:0
        delay: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
        duration: CONFIG.INSTRUCTIONAL_SHORT_DURATION
      ]
    )

    return endTurnInstruction

    # legacy - remove once there is less churn on tutorial
#  @getPositionForEndTurn: () ->
#    return {x:8.9,y:-.25}
#
#  @getPositionForManaBar: () ->
##    return {x:-1,y:2.5}
#    return {x:-1,y:3.5} # points to 3rd mana crystal
#
#  @getPositionForReplace: () ->
##    return {x:-1.5,y:-.5}
#    return {x:-1.5,y:-.5}

  # TODO: either tie to cardnode or use real pixel values
  @getPositionForHandIndex: (index) ->
#    return {x:index*7/5,y:-1}
    return {x:(-.1 + index*7/5),y:-.25}

module.exports = Instruction
