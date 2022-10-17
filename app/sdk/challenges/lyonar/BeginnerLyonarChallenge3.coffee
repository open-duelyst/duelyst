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


# http://forums.duelyst.com/t/lyonar-owl-punch/9396

class BeginnerLyonarChallenge3 extends Challenge

  @type: "BeginnerLyonarChallenge3"
  type: "BeginnerLyonarChallenge3"
  categoryType: ChallengeCategory.vault2.type

  name: i18next.t("challenges.beginner_lyonar_3_title")
  description:i18next.t("challenges.beginner_lyonar_3_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_lyonar_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_lyonar_3_fail")
  ]

  battleMapTemplateIndex: 1
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 7
  startingHandSizePlayer: 5

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Spell.Tempest}
      {id: Cards.Spell.AurynNexus}
      {id: Cards.Spell.Magnetize}
      {id: Cards.Spell.LionheartBlessing}
      {id: Cards.Neutral.AlcuinLoremaster}
      {id: Cards.Spell.DivineBond}
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
    general1.setPosition({x: 3, y:2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25

    @applyCardToBoard({id: Cards.Neutral.Manaforger},2,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.SilverguardSquire},2,1,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.OwlbeastSage},2,2,myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.HailstoneGolem},4,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.RockPulverizer},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.BloodshardGolem},4,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.GolemMetallurgist},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.BrightmossGolem},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.SkyrockGolem},5,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_lyonar_3_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerLyonarChallenge3
