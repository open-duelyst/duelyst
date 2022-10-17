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

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class BeginnerVanarChallenge4 extends Challenge

  @type: "BeginnerVanarChallenge4"
  type: "BeginnerVanarChallenge4"
  categoryType: ChallengeCategory.beginner.type

  name: i18next.t("challenges.beginner_vanar_4_title")
  description:i18next.t("challenges.beginner_vanar_4_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vanar_4_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vanar_4_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 7
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Faction6.WyrBeast}
      {id: Cards.Spell.BonechillBarrier}
      {id: Cards.Neutral.SaberspineTiger}
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
    general1.setPosition({x: 0, y: 0})
    general1.maxHP = 25
    general1.setDamage(25-1)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 4})
    general2.maxHP = 25
    general2.setDamage(25-3)

    @applyCardToBoard({id: Cards.Neutral.Maw}, 2, 2, opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Maw}, 2, 0, opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.KomodoCharger}, 3, 3, opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.KomodoCharger}, 3, 1, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.YoungSilithar}, 4, 3, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.YoungSilithar}, 4, 1, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.EarthWalker}, 5, 3, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.EarthWalker}, 5, 1, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Grimrock}, 6, 4, opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Grimrock}, 6, 2, opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vanar_4_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVanarChallenge4
