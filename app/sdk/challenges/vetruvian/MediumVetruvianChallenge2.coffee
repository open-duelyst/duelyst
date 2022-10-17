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

# http://forums.duelyst.com/t/winds-of-change-gate-5-slot-4/12215

class MediumVetruvianChallenge2 extends Challenge

  @type: "MediumVetruvianChallenge2"
  type: "MediumVetruvianChallenge2"
  categoryType: ChallengeCategory.advanced.type


  name: i18next.t("challenges.medium_vetruvian_2_title")
  description:i18next.t("challenges.medium_vetruvian_2_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.medium_vetruvian_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.medium_vetruvian_2_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Spell.RashasCurse}
      {id: Cards.Faction3.BrazierGoldenFlame}
      {id: Cards.Neutral.PrimusFist}
      {id: Cards.Faction3.Dunecaster}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 1, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-8)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-14)

    @applyCardToBoard({id: Cards.Faction3.SandHowler}, 2, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction3.OrbWeaver}, 3, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction3.OrbWeaver}, 3, 1, myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.HailstoneHowler},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.KaidoAssassin},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.MageOfFourWinds},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.FlameWing},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.FlameWing},5,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.HailstoneHowler},6,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.medium_vetruvian_2_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.7
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = MediumVetruvianChallenge2
