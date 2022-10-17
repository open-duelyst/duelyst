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


# http://forums.duelyst.com/t/songhype-challenge/8451

class BeginnerSonghaiChallenge5 extends Challenge

  @type: "BeginnerSonghaiChallenge5"
  type: "BeginnerSonghaiChallenge5"
  categoryType: ChallengeCategory.beginner2.type

  name: i18next.t("challenges.beginner_songhai_5_title")
  description:i18next.t("challenges.beginner_songhai_5_description")
  iconUrl: RSX.speech_portrait_songhai.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_songhai_5_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_songhai_5_fail")
  ]

  battleMapTemplateIndex: 1
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.Neutral.SaberspineTiger}
      {id: Cards.Spell.SaberspineSeal}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 1, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-10)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-3)

    @applyCardToBoard({id: Cards.Faction1.SilverguardKnight},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},7,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},7,3,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_songhai_5_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerSonghaiChallenge5
