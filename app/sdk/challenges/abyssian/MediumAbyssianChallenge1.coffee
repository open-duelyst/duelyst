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


# http://forums.duelyst.com/t/abyss-super-creep-medium/8970

class MediumAbyssianChallenge1 extends Challenge

  @type: "MediumAbyssianChallenge1"
  type: "MediumAbyssianChallenge1"
  categoryType: ChallengeCategory.vault1.type

  name:i18next.t("challenges.medium_abyss_1_title")
  description:i18next.t("challenges.medium_abyss_1_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.medium_abyss_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.medium_abyss_1_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6
  usesResetTurn: false

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Spell.DarkSacrifice}
      {id: Cards.Spell.SoulshatterPact}
      {id: Cards.Spell.VoidPulse}
      {id: Cards.Faction4.DarkSiren}
      {id: Cards.Spell.ShadowNova}
      {id: Cards.Neutral.Manaforger}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y: 2})
    general1.maxHP = 4
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 20

    @applyCardToBoard({id: Cards.Faction4.SharianShadowdancer}, 1, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler}, 3, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalCrawler}, 3, 1, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalJuggernaut}, 4, 4, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.AbyssalJuggernaut}, 4, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Artifact.SpectralBlade}, 2, 2, myPlayerId)

    @applyCardToBoard({id: Cards.Faction1.WindbladeAdept},6,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.AzuriteLion},5,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.LysianBrawler},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.SunstoneTemplar},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.SilverguardKnight},6,3,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.medium_abyss_1_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = MediumAbyssianChallenge1
