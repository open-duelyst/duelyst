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


# http://forums.duelyst.com/t/songhype-challenge/8451

class BeginnerSonghaiChallenge1 extends Challenge

  @type: "BeginnerSonghaiChallenge1"
  type: "BeginnerSonghaiChallenge1"
  categoryType: ChallengeCategory.advanced.type

  name: i18next.t("challenges.beginner_songhai_1_title")
  description:i18next.t("challenges.beginner_songhai_1_description")
  iconUrl: RSX.speech_portrait_songhai.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_songhai_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_songhai_1_fail")
  ]

  battleMapTemplateIndex: 2
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 5
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.Spell.PhoenixFire}
      {id: Cards.Spell.InnerFocus}
      {id: Cards.Spell.MistDragonSeal}
      {id: Cards.Spell.ManaVortex}
      {id: Cards.Spell.SaberspineSeal}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 25
    general1.setDamage(23)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25

    @applyCardToBoard({id: Cards.Faction2.ChakriAvatar}, 3, 1, myPlayerId)
    @applyCardToBoard({id: Cards.Faction2.MageOfFourWinds}, 3, 3, myPlayerId)

    @applyCardToBoard({id: Cards.Faction5.Phalanxar},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.UnstableLeviathan},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction5.VeteranSilithar},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_songhai_1_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerSonghaiChallenge1
