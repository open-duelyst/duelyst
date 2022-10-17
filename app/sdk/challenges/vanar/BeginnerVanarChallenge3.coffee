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
_ = require 'underscore'
i18next = require('i18next')

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class BeginnerVanarChallenge3 extends Challenge

  @type: "BeginnerVanarChallenge3"
  type: "BeginnerVanarChallenge3"
  categoryType: ChallengeCategory.expert.type

  name: i18next.t("challenges.beginner_vanar_3_title")
  description:i18next.t("challenges.beginner_vanar_3_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vanar_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vanar_3_fail")
  ]

  battleMapTemplateIndex: 3
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 6
  startingHandSizePlayer: 4

  constructor: ()->
    super()
    @hiddenUIElements = _.without(@hiddenUIElements, "SignatureCard")

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Faction6.Razorback}
      {id: Cards.Faction6.HearthSister}
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
    general1.setPosition({x: 0, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-3)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 2, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-7)

    # set signature card to be always ready for this session
    gameSession.getPlayer1().setIsSignatureCardActive(true)

    @applyCardToBoard({id: Cards.Faction6.CrystalWisp}, 2, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.CrystalWisp}, 2, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.CrystalWisp}, 8, 2, myPlayerId)

    @applyCardToBoard({id: Cards.Artifact.SpectralBlade}, 2, 2, opponentPlayerId)

    @applyCardToBoard({id: Cards.Tile.BonusMana},5,2)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vanar_3_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVanarChallenge3
