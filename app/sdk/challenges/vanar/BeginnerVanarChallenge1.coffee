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

class BeginnerVanarChallenge1 extends Challenge

  @type: "BeginnerVanarChallenge1"
  type: "BeginnerVanarChallenge1"
  categoryType: ChallengeCategory.vault1.type

  name: i18next.t("challenges.beginner_vanar_1_title")
  description:i18next.t("challenges.beginner_vanar_1_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vanar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vanar_1_fail")
  ]

  battleMapTemplateIndex: 3
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Faction6.BoreanBear}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Spell.Cryogenesis}
      {id: Cards.Spell.IceCage}
      {id: Cards.Spell.AspectOfTheWolf}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 3, y: 3})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 8

    @applyCardToBoard({id: Cards.Faction6.SnowElemental}, 2, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 3, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.CrystalCloaker}, 3, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 4, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 4, 3, myPlayerId)

    @applyCardToBoard({id: Cards.Faction3.StarfireScarab},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction3.Dervish},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction3.PortalGuardian},5,2,opponentPlayerId)
    dunecasterUnit = @applyCardToBoard({id: Cards.Faction3.Dunecaster},6,3,opponentPlayerId)
    @applyCardToBoard(dunecasterUnit.getCurrentFollowupCard(),5,3,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vanar_1_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVanarChallenge1
