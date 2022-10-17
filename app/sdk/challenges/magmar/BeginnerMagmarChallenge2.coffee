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


# http://forums.duelyst.com/t/magmar-claw-bomb/8285

class BeginnerMagmarChallenge2 extends Challenge

  @type: "BeginnerMagmarChallenge2"
  type: "BeginnerMagmarChallenge2"
  categoryType: ChallengeCategory.expert.type

  name: i18next.t("challenges.beginner_magmar_2_title")
  description:i18next.t("challenges.beginner_magmar_2_description")
  iconUrl: RSX.speech_portrait_magmar.img

  _musicOverride: RSX.music_gauntlet.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_magmar_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_magmar_2_fail")
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
      {id: Cards.Faction5.General}
      {id: Cards.Artifact.AdamantineClaws}
      {id: Cards.Spell.FlashReincarnation}
      {id: Cards.Neutral.SilhoutteTracer}
      {id: Cards.Neutral.EphemeralShroud}
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
    general2.setPosition({x: 5, y: 1})
    general2.maxHP = 25
    general2.setDamage(25-7)

    # set signature card to be always ready for this session
    gameSession.getPlayer1().setIsSignatureCardActive(true)

    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},2,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},3,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},4,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier},5,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.BonusMana},5,2)


  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_magmar_2_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerMagmarChallenge2
