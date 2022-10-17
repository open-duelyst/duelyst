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
ModifierOpeningGambitBuffSelfByShadowTileCount = require('app/sdk/modifiers/modifierOpeningGambitBuffSelfByShadowTileCount')
i18next = require('i18next')

# http://forums.duelyst.com/t/bad-to-the-bone-gate-2-slot-4/14483

class BeginnerVetruvianChallenge4 extends Challenge

  @type: "BeginnerVetruvianChallenge4"
  type: "BeginnerVetruvianChallenge4"
  categoryType: ChallengeCategory.beginner.type


  name: i18next.t("challenges.beginner_vetruvian_4_title")
  description:i18next.t("challenges.beginner_vetruvian_4_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vetruvian_4_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vetruvian_4_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Spell.BoneSwarm}
      {id: Cards.Spell.AstralPhasing}
      {id: Cards.Neutral.FrostboneNaga}
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
    general1.setPosition({x: 4, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-6)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-8)

    @applyCardToBoard({id: Cards.Neutral.BluetipScorpion},1,2,myPlayerId)
    @applyCardToBoard({id: Cards.Faction3.OrbWeaver},5,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction3.OrbWeaver},5,1,myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},6,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.RockPulverizer},7,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.RockPulverizer},7,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vetruvian_4_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVetruvianChallenge4
