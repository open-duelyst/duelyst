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

# http://forums.duelyst.com/t/lyonar-owl-punch/9396

class BeginnerLyonarChallenge4 extends Challenge

  @type: "BeginnerLyonarChallenge4"
  type: "BeginnerLyonarChallenge4"
  categoryType: ChallengeCategory.starter.type

  name: i18next.t("challenges.beginner_lyonar_4_title")
  description:i18next.t("challenges.beginner_lyonar_4_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_lyonar_4_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_lyonar_4_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Spell.Tempest}
      {id: Cards.Spell.Martyrdom}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 3, y:2})
    general1.maxHP = 25
    general1.setDamage(25-2)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-7)

    @applyCardToBoard({id: Cards.Faction1.SilverguardKnight},2,2,myPlayerId)

    @applyCardToBoard({id: Cards.Faction5.Phalanxar},4,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Phalanxar},4,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Phalanxar},6,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_lyonar_4_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerLyonarChallenge4
