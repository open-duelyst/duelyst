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


# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class BeginnerAbyssianChallenge1 extends Challenge

  @type: "BeginnerAbyssianChallenge1"
  type: "BeginnerAbyssianChallenge1"
  categoryType: ChallengeCategory.beginner2.type

  name:i18next.t("challenges.beginner_abyss_1_title")
  description:i18next.t("challenges.beginner_abyss_1_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_abyss_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_abyss_1_fail")
  ]

  battleMapTemplateIndex: 5
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Spell.CurseOfAgony}
      {id: Cards.Spell.RitualBanishing}
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
    general1.setPosition({x: 3, y: 2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 11

    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler}, 2, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.ShadowWatcher}, 4, 2, myPlayerId)

    @applyCardToBoard({id: Cards.Faction1.WindbladeAdept},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.AzuriteLion},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_abyss_1_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent:true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerAbyssianChallenge1
