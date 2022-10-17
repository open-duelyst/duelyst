Challenge = require("app/sdk/challenges/challenge")
Instruction   = require 'app/sdk/challenges/instruction'
MoveAction     = require 'app/sdk/actions/moveAction'
AttackAction   = require 'app/sdk/actions/attackAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
EndTurnAction   = require 'app/sdk/actions/endTurnAction'
Cards       = require 'app/sdk/cards/cardsLookupComplete'
Deck       = require 'app/sdk/cards/deck'
GameSession       = require 'app/sdk/gameSession'
AgentActions = require 'app/sdk/agents/agentActions'
CONFIG = require 'app/common/config'
RSX = require('app/data/resources')
ChallengeCategory = require('app/sdk/challenges/challengeCategory')
i18next = require('i18next')

# http://forums.duelyst.com/t/starter-challenge-lyonar-a/7563

class BeginnerLyonarChallenge1 extends Challenge

  @type: "BeginnerLyonarChallenge1"
  type: "BeginnerLyonarChallenge1"
  categoryType: ChallengeCategory.beginner.type

  name: i18next.t("challenges.beginner_lyonar_1_title")
  description:i18next.t("challenges.beginner_lyonar_1_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_mainmenu_lyonar.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_lyonar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_lyonar_1_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 5

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Artifact.SunstoneBracers}
      {id: Cards.Spell.WarSurge}
      {id: Cards.Spell.DivineBond}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Tutorial.TutorialOpponentGeneral1}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 3

    @applyCardToBoard({id: Cards.Faction1.SilverguardSquire}, 3, 1, myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.AzuriteLion}, 3, 3, myPlayerId)

    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.SuntideMaiden},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.ArclyteSentinel},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_lyonar_1_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerLyonarChallenge1
