Challenge = require("app/sdk/challenges/challenge")
Instruction   = require 'app/sdk/challenges/instruction'
MoveAction     = require 'app/sdk/actions/moveAction'
AttackAction   = require 'app/sdk/actions/attackAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
EndTurnAction   = require 'app/sdk/actions/endTurnAction'
Cards       = require 'app/sdk/cards/cardsLookupComplete'
Deck       = require 'app/sdk/cards/deck'
AgentActions = require 'app/sdk/agents/agentActions'
CONFIG = require 'app/common/config'
RSX = require('app/data/resources')
GameSession = require('app/sdk/gameSession')
ChallengeCategory = require('app/sdk/challenges/challengeCategory')
i18next = require('i18next')

class LessonOne extends Challenge

  @type: "LessonOne"
  type: "LessonOne"
  categoryType: ChallengeCategory.tutorial.type

  name: i18next.t("tutorial.lesson_1_title"),
  description: i18next.t("tutorial.lesson_1_description"),
  difficulty: i18next.t("tutorial.lesson_1_difficulty"),
  otkChallengeStartMessage: i18next.t("tutorial.lesson_1_start_message")
  otkChallengeFailureMessages: [
    i18next.t("tutorial.lesson_1_failure_message")
  ]

  iconUrl: RSX.speech_portrait_calibero.img
  _musicOverride: RSX.music_battle_tutorial.audio

  battleMapTemplateIndex: 0
  startingHandSizePlayer: 0
  startingHandSizeOpponent: 4
  usesResetTurn: false

  constructor: ()->
    super()

    @showCardInstructionalTextForTurns = 7

    @hiddenUIElements.push("CardCount")
    @hiddenUIElements.push("Replace")

    @addInstructionToQueueForTurnIndex(0,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_0_failure_message_1")
      sourcePosition:
        x:2
        y:2
      targetPosition:
        x:4
        y:2
      expectedActionType: MoveAction.type
      preventSelectionUntilLabelIndex: 5
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_1")
        position:
          x:2
          y:2
        triggersInstructionIndex:1
        #focusRight:true
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
      ,
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_2")
        position:
          x:2
          y:2
        triggersInstructionIndex:2
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
      ,
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_3")
        positionAtMyHealth:true
        triggersInstructionIndex:3
        focusUp:true
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
      ,
#        label:"This is your [Enemy's Health]!"
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_4")
        positionAtEnemyHealth:true
        triggersInstructionIndex:4
        focusUp:true
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
      ,
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_5")
        position:
          x:2
          y:2
        triggersInstructionIndex:5
      ,
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_6")
        position:
          x:2
          y:2
      ]
    ))

    @addInstructionToQueueForTurnIndex(0,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_0_failure_message_2")
      sourcePosition:
        x:4
        y:2
      targetPosition:
        x:5
        y:2
      expectedActionType: AttackAction.type
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_0_instruction_7")
        delay:CONFIG.INSTRUCTIONAL_MANUAL_DEFAULT_DELAY
        position:
          x:5
          y:2
        triggersInstructionIndex:0
      ]
    ))

    @addInstructionToQueueForTurnIndex(0, Instruction.createEndTurnInstruction())

    @addInstructionToQueueForTurnIndex(1,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_1_failure_message_1")
      expectedActionType: PlayCardFromHandAction.type
      handIndex: 0
      preventSelectionUntilLabelIndex: 2
      targetPosition:
        x:5
        y:1
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_1_instruction_1")
        positionAtManaIndex:2
        focusUp:true
        triggersInstructionIndex:1
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
      ,
        label:i18next.t("tutorial.lesson_1_turn_1_instruction_2")
        isSpeech:true
        isPersistent:true
        yPosition: .6
        triggersInstructionIndex:2
      ,
        label:i18next.t("tutorial.lesson_1_turn_1_instruction_3")
        duration: 60
        positionAtHandIndex: 0
        triggersInstructionIndex:2
      ]
    ))

    @addInstructionToQueueForTurnIndex(1,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_1_failure_message_2")
      expectedActionType: AttackAction.type
      sourcePosition:
        x:4
        y:2
      targetPosition:
        x:5
        y:2
      preventSelectionUntilLabelIndex: 1
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_1_instruction_4")
        position:
          x:5
          y:1
        focusRight:true
        duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
        triggersInstructionIndex:1
      ,
        label:i18next.t("tutorial.lesson_1_turn_1_instruction_4")
        position:
          x:5
          y:2
        delay:CONFIG.INSTRUCTIONAL_MANUAL_DEFAULT_DELAY
      ]
    ))

    @addInstructionToQueueForTurnIndex(1,Instruction.createEndTurnInstruction())

    @addInstructionToQueueForTurnIndex(2,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_2_failure_message_1")
      handIndex: 0
      targetPosition:
        x:5
        y:2
      expectedActionType: PlayCardFromHandAction.type
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_2_instruction_1")
        positionAtHandIndex: 0
        delay:CONFIG.INSTRUCTIONAL_MANUAL_DEFAULT_DELAY
        triggersInstructionIndex:0
      ]
    ))

    @addInstructionToQueueForTurnIndex(2,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_2_failure_message_2")
      expectedActionType: AttackAction.type
      sourcePosition:
        x:4
        y:2
      targetPosition:
        x:5
        y:1
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_2_instruction_2")
        position:
          x:5
          y:1
        delay:CONFIG.INSTRUCTIONAL_MANUAL_DEFAULT_DELAY
        triggersInstructionIndex:0
        focusLeft: true
      ]
    ))

    # TODO: this needs to be click through
    @addInstructionToQueueForTurnIndex(2,new Instruction(
      failedLabel:i18next.t("tutorial.lesson_1_turn_2_failure_message_3")
      expectedActionType:EndTurnAction.type
      instructionLabels:[
        label:i18next.t("tutorial.lesson_1_turn_2_instruction_3")
        isPersistent: true
        isSpeech: true
        yPosition: .6
        triggersInstructionIndex:null
      ]
    ))

    @snapShotOnPlayerTurn = 3

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Tutorial.TutorialGeneral}
      {id: Cards.Tutorial.TutorialBrightmossGolem}
      {id: Cards.Tutorial.TutorialThornNeedler}
      {id: Cards.Tutorial.TutorialSkyrockGolem}
      {id: Cards.Tutorial.TutorialStormmetalGolem}
      {id: Cards.Tutorial.TutorialBrightmossGolem}
      {id: Cards.Tutorial.TutorialIceGolem}
      {id: Cards.Tutorial.TutorialBloodshardGolem}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Tutorial.TutorialOpponentGeneral1}
      {id: Cards.TutorialSpell.TutorialFireOrb}
      {id: Cards.Tutorial.TutorialGuardian}
      {id: Cards.Tutorial.TutorialLion}
      {id: Cards.Tutorial.TutorialBrawler}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y: 2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 10

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    # turn 1
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("tutorial.lesson_1_turn_0_instruction_8")
      positionAtHandIndex:0
      triggersInstructionIndex:1
      duration: CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION
#    ,
#      label:"Bring it on!"
#      isSpeech:true
#      yPosition:.7
#      isPersistent: true
#      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionAttackWithUnit("general",{x:-1,y:0},false))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("tutorial.lesson_1_taunt_1")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCard(0,{x:6,y:1}))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionTagUnitAtPosition("golem",{x:6,y:1}))

    # turn 2
    @_opponentAgent.addActionForTurn(1,AgentActions.createAgentActionAttackWithUnit("golem",{x:-1,y:0},false))
    @_opponentAgent.addActionForTurn(1,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("tutorial.lesson_1_taunt_2")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(1,AgentActions.createAgentActionMoveUnit("general",{x:1,y:-1}))
    @_opponentAgent.addActionForTurn(1,AgentActions.createAgentActionPlayCard(1,{x:5,y:1}))
    @_opponentAgent.addActionForTurn(1,AgentActions.createAgentSoftActionTagUnitAtPosition("tutorialLion",{x:5,y:1}))

    # turn 3
#    @_opponentAgent.addActionForTurn(2,AgentActions.createAgentSoftActionShowInstructionLabels([
#      label:"I will unleash my power."
#      isSpeech:true
#      yPosition:.6
#      isPersistent: true
#      isOpponent: true
#    ]))
    @_opponentAgent.addActionForTurn(2,AgentActions.createAgentActionMoveUnit("general",{x:2,y:0}))
    @_opponentAgent.addActionForTurn(2,AgentActions.createAgentActionPlayCard(2,{x:7,y:1}))

    # cast otk finisher on player general
    @_opponentAgent.addActionForTurn(3,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("tutorial.lesson_1_taunt_3")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(3,AgentActions.createAgentActionPlayCardFindPosition(3,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))



module.exports = LessonOne
