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

# http://forums.duelyst.com/t/vanar-frozen-shadows/10463

class BeginnerVanarChallenge2 extends Challenge

  @type: "BeginnerVanarChallenge2"
  type: "BeginnerVanarChallenge2"
  categoryType: ChallengeCategory.advanced.type

  name: i18next.t("challenges.beginner_vanar_2_title")
  description:i18next.t("challenges.beginner_vanar_2_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vanar_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vanar_2_fail")
  ]

  battleMapTemplateIndex: 3
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Spell.PermafrostShield}
      {id: Cards.Artifact.Snowpiercer}
      {id: Cards.Spell.ElementalFury}
      {id: Cards.Spell.BonechillBarrier}
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
    general1.setPosition({x: 2, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-9)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-9)

    @applyCardToBoard({id: Cards.Faction6.BoreanBear}, 3, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.CrystalCloaker}, 3, 1, myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.ShadowReflection},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.ShadowReflection},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vanar_2_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent:true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVanarChallenge2
