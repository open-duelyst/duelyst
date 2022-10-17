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

# http://forums.duelyst.com/t/starter-challenge-1-lyonar-b/7337

class BeginnerLyonarChallenge2 extends Challenge

  @type: "BeginnerLyonarChallenge2"
  type: "BeginnerLyonarChallenge2"
  categoryType: ChallengeCategory.beginner2.type

  name: i18next.t("challenges.beginner_lyonar_2_title")
  description:i18next.t("challenges.beginner_lyonar_2_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_lyonar_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_lyonar_2_fail")
  ]

  battleMapTemplateIndex: 1
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Artifact.SunstoneBracers}
      {id: Cards.Spell.TrueStrike}
      {id: Cards.Spell.DivineBond}
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
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 13

    @applyCardToBoard({id: Cards.Faction1.WindbladeAdept}, 4, 1, myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian}, 4, 3, myPlayerId)

    @applyCardToBoard({id: Cards.Faction5.Phalanxar},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},5,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_lyonar_2_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent:true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerLyonarChallenge2
