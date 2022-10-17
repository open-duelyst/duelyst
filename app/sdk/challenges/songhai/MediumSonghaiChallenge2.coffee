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

# http://forums.duelyst.com/t/bladedance-basic-otk-gate-5-slot-5/12316


class MediumSonghaiChallenge2 extends Challenge

  @type: "MediumSonghaiChallenge2"
  type: "MediumSonghaiChallenge2"
  categoryType: ChallengeCategory.vault2.type

  name: i18next.t("challenges.medium_songhai_2_title")
  description:i18next.t("challenges.medium_songhai_2_description")
  iconUrl: RSX.speech_portrait_songhai.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.medium_songhai_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.medium_songhai_2_fail")
  ]

  battleMapTemplateIndex: 2
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 3
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.Neutral.PrimusFist}
      {id: Cards.Spell.InnerFocus}
      {id: Cards.Spell.SaberspineSeal}
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
    general1.setPosition({x: 1, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-6)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-12)

    @applyCardToBoard({id: Cards.Neutral.DaggerKiri},2,2,myPlayerId)

    @applyCardToBoard({id: Cards.Faction5.YoungSilithar},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.EarthWalker},6,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Grimrock},6,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.medium_songhai_2_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = MediumSonghaiChallenge2
