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


# http://forums.duelyst.com/t/crushing-reach-basic-otk/11712

class BeginnerMagmarChallenge3 extends Challenge

  @type: "BeginnerMagmarChallenge3"
  type: "BeginnerMagmarChallenge3"
  categoryType: ChallengeCategory.keywords.type

  name: i18next.t("challenges.beginner_magmar_3_title")
  description:i18next.t("challenges.beginner_magmar_3_description")
  iconUrl: RSX.speech_portrait_magmar.img

  _musicOverride: RSX.music_gauntlet.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_magmar_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_magmar_3_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 8
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.Spell.BoundedLifeforce}
      {id: Cards.Spell.GreaterFortitude}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 25
    general1.setDamage(25-10)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-8)

    @applyCardToBoard({id: Cards.Neutral.FireSpitter},0,4,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.ValeHunter},0,0,myPlayerId)

    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},3,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.CrystalCloaker},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},3,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},4,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BoreanBear},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},4,0,opponentPlayerId)
    #@applyCardToBoard({id: Cards.Neutral.WindStopper},6,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_magmar_3_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerMagmarChallenge3
