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
ModifierSummonWatchByEntityBuffSelf = require('app/sdk/modifiers/modifierSummonWatchByEntityBuffSelf')
i18next = require('i18next')


# http://forums.duelyst.com/t/gifts-ungiven-basic-otk-gate-2-slot-3/12429

class BeginnerAbyssianChallenge5 extends Challenge

  @type: "BeginnerAbyssianChallenge5"
  type: "BeginnerAbyssianChallenge5"
  categoryType: ChallengeCategory.beginner.type

  name:i18next.t("challenges.beginner_abyss_5_title")
  description:i18next.t("challenges.beginner_abyss_5_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_abyss_5_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_abyss_5_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 1

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Spell.SoulshatterPact}
      {id: Cards.Neutral.Crossbones}
      {id: Cards.Neutral.SaberspineTiger}
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
    general1.setPosition({x: 3, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-5)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-7)

    @applyCardToBoard({id: Cards.Neutral.VoidHunter}, 2, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.VoidHunter}, 2, 1, myPlayerId)

    @applyCardToBoard({id: Cards.Faction2.HamonBlademaster},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.Widowmaker},5,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_abyss_5_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerAbyssianChallenge5
