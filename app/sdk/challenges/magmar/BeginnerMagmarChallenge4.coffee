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


# http://forums.duelyst.com/t/shattered-memories-basic-otk-gate-2-slot-5/12275

class BeginnerMagmarChallenge4 extends Challenge

  @type: "BeginnerMagmarChallenge4"
  type: "BeginnerMagmarChallenge4"
  categoryType: ChallengeCategory.beginner.type

  name: i18next.t("challenges.beginner_magmar_4_title")
  description:i18next.t("challenges.beginner_magmar_4_description")
  iconUrl: RSX.speech_portrait_magmar.img

  _musicOverride: RSX.music_gauntlet.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_magmar_4_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_magmar_4_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.Spell.PlasmaStorm}
      {id: Cards.Neutral.CoiledCrawler}
      {id: Cards.Spell.NaturalSelection}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 25
    general1.setDamage(25-3)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-13)

    @applyCardToBoard({id: Cards.Faction5.Phalanxar},2,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Elucidator},2,1,myPlayerId)

    @applyCardToBoard({id: Cards.Artifact.SpectralBlade},3,2,opponentPlayerId)

    @applyCardToBoard({id: Cards.Faction4.BlackSolus},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.BloodmoonPriestess},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.NightsorrowAssassin},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.NightsorrowAssassin},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.GloomChaser},6,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.GloomChaser},6,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_magmar_4_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerMagmarChallenge4
