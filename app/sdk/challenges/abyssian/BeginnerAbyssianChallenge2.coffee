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


# http://forums.duelyst.com/t/abyssian-dance-of-shadows/8288

class BeginnerAbyssianChallenge2 extends Challenge

  @type: "BeginnerAbyssianChallenge2"
  type: "BeginnerAbyssianChallenge2"
  categoryType: ChallengeCategory.expert.type

  name:i18next.t("challenges.beginner_abyss_2_title")
  description:i18next.t("challenges.beginner_abyss_2_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_abyss_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_abyss_2_fail")
  ]

  battleMapTemplateIndex: 5
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  constructor: ()->
    super()
    @hiddenUIElements = _.without(@hiddenUIElements, "SignatureCard")

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Neutral.SaberspineTiger}
      {id: Cards.Faction4.DeepfireDevourer}
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
    general1.setPosition({x: 2, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-4)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-16)

    # set signature card to be always ready for this session
    gameSession.getPlayer1().setIsSignatureCardActive(true)

    @applyCardToBoard({id: Cards.Faction4.SharianShadowdancer}, 1, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.BloodmoonPriestess}, 2, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.BloodmoonPriestess}, 2, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.GloomChaser}, 3, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling}, 1, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling}, 3, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling}, 1, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling}, 3, 4, myPlayerId)

    @applyCardToBoard({id: Cards.Faction2.LanternFox},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.LanternFox},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_abyss_2_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerAbyssianChallenge2
