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
ModifierOpeningGambitApplyPlayerModifiers = require('app/sdk/modifiers/modifierOpeningGambitApplyPlayerModifiers')
UtilsGameSession = require 'app/common/utils/utils_game_session'
i18next = require('i18next')

# http://forums.duelyst.com/t/desperation-otk-1/11400

class AdvancedLyonarChallenge1 extends Challenge

  @type: "AdvancedLyonarChallenge1"
  type: "AdvancedLyonarChallenge1"
  categoryType: ChallengeCategory.contest1.type

  name: i18next.t("challenges.advanced_lyonar_1_title")
  description:i18next.t("challenges.advanced_lyonar_1_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_lyonar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_lyonar_1_fail")
  ]

  battleMapTemplateIndex: 1
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 5

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Spell.Magnetize}
      {id: Cards.Neutral.AlcuinLoremaster}
      {id: Cards.Spell.DivineBond}
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
    general1.setPosition({x: 4, y: 3})
    general1.maxHP = 25
    general1.setDamage(25-5)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 0})
    general2.maxHP = 25
    general2.setDamage(25-10)

    @applyCardToBoard({id: Cards.Faction1.SuntideMaiden},6,2,myPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,myPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.SkyrockGolem},4,1,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.Lightchaser},4,0,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.SunstoneTemplar},5,3,myPlayerId)

    ladyLocke = @applyCardToBoard({id: Cards.Neutral.LadyLocke},7,0,opponentPlayerId)
    windbladeAdept = @applyCardToBoard({id: Cards.Faction1.WindbladeAdept},7,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},6,1,opponentPlayerId)
    # Apply lady lock buff to windblade adept
    lockPlayerModifier = ladyLocke.getModifierByType(ModifierOpeningGambitApplyPlayerModifiers.type)
    for modifierContextObject in lockPlayerModifier.modifiersContextObjects[0].modifiersContextObjects
      gameSession.applyModifierContextObject(modifierContextObject, windbladeAdept)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_lyonar_1_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedLyonarChallenge1
