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

class BeginnerFlyingChallenge1 extends Challenge

  @type: "BeginnerFlyingChallenge1"
  type: "BeginnerFlyingChallenge1"
  categoryType: ChallengeCategory.keywords.type


  name:i18next.t("challenges.beginner_flying_challenge_title"),
  description:i18next.t("challenges.beginner_flying_challenge_description"),
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_flying_challenge_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_flying_challenge_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Spell.AurynNexus}
      {id: Cards.Spell.Tempest}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 1, y: 3})
    general1.maxHP = 5
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 4

    @applyCardToBoard({id: Cards.Neutral.SpottedDragonlark}, 0, 2, myPlayerId)

    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},6,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},6,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler},7,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},7,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler},7,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_flying_challenge_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.7
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerFlyingChallenge1
