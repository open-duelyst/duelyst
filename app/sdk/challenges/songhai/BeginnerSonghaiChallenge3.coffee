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


# http://forums.duelyst.com/t/songhai-controlled-chaos/10473

class BeginnerSonghaiChallenge3 extends Challenge

  @type: "BeginnerSonghaiChallenge3"
  type: "BeginnerSonghaiChallenge3"
  categoryType: ChallengeCategory.vault2.type

  name: i18next.t("challenges.beginner_songhai_3_title")
  description:i18next.t("challenges.beginner_songhai_3_description")
  iconUrl: RSX.speech_portrait_songhai.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_songhai_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_songhai_3_fail")
  ]

  battleMapTemplateIndex: 2
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.Spell.DeathstrikeSeal}
      {id: Cards.Spell.SpiralTechnique}
      {id: Cards.Spell.TwinStrike}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 3, y: 4})
    general1.maxHP = 25
    general1.setDamage(20)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-13)

    @applyCardToBoard({id: Cards.Faction2.Heartseeker},1,2,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},2,2,myPlayerId)
    @applyCardToBoard({id: Cards.Faction2.ChakriAvatar},3,0,myPlayerId)
    @applyCardToBoard({id: Cards.Faction2.JadeOgre},4,2,myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.ChaosElemental},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.ChaosElemental},5,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},6,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_songhai_3_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerSonghaiChallenge3
