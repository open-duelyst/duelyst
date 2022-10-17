Challenge = require("app/sdk/challenges/challenge")
Instruction   = require 'app/sdk/challenges/instruction'
MoveAction     = require 'app/sdk/actions/moveAction'
AttackAction   = require 'app/sdk/actions/attackAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
EndTurnAction   = require 'app/sdk/actions/endTurnAction'
Cards       = require 'app/sdk/cards/cardsLookupComplete'
Deck       = require 'app/sdk/cards/deck'
AgentActions = require 'app/sdk/agents/agentActions'
GameSession       = require 'app/sdk/gameSession'
CONFIG = require 'app/common/config'
RSX = require('app/data/resources')
ChallengeCategory = require('app/sdk/challenges/challengeCategory')
Modifier = require('app/sdk/modifiers/modifier')
_ = require('underscore')
i18next = require('i18next')


# http://forums.duelyst.com/t/malediction-otk-1/11423

class AdvancedAbyssianChallenge1 extends Challenge

  @type: "AdvancedAbyssianChallenge1"
  type: "AdvancedAbyssianChallenge1"
  categoryType: ChallengeCategory.contest2.type

  name: i18next.t("challenges.advanced_abyss_1_title")
  description:i18next.t("challenges.advanced_abyss_1_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_abyss_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_abyss_1_fail")
  ]

  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6
  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  usesResetTurn: false

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Spell.ConsumingRebirth}
      {id: Cards.Spell.DaemonicLure}
      {id: Cards.Faction4.AbyssalCrawler}
      {id: Cards.Spell.CurseOfAgony}
      {id: Cards.Neutral.RepulsionBeast}
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
    general1.setPosition({x: 2, y: 3})
    general1.maxHP = 25
    general1.setDamage(25-5)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 4})
    general2.maxHP = 25
    general2.setDamage(25-3)

    @applyCardToBoard({id: Cards.Faction4.NightsorrowAssassin}, 1, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.SaberspineTiger}, 4, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow}, 4, 2, myPlayerId)

    rockPulverizer1 = @applyCardToBoard({id: Cards.Neutral.RockPulverizer},4,3,opponentPlayerId)
    rockPulverizer2 = @applyCardToBoard({id: Cards.Neutral.RockPulverizer},5,2,opponentPlayerId)
    swampEntangler = @applyCardToBoard({id: Cards.Neutral.VineEntangler},7,3,opponentPlayerId)
    silverguardKnight = @applyCardToBoard({id: Cards.Faction1.SilverguardKnight},7,4,opponentPlayerId)
    primusShieldmaster1 = @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},6,1,opponentPlayerId)
    primusShieldmaster2 = @applyCardToBoard({id: Cards.Neutral.PrimusShieldmaster},7,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.WarSurge},4,2,opponentPlayerId)

    hailStoneHowler = @applyCardToBoard({id: Cards.Neutral.HailstoneHowler},5,3,opponentPlayerId)
    # Every enemy unit above here has 2 azure horn shaman buffs

    # ironcliffe only has one azure horn shaman buff
    ironcliffeGuardian = @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},8,3,opponentPlayerId)

    # add first shaman buffs
    unitsToReceiveBuff = [rockPulverizer1,rockPulverizer2,swampEntangler,silverguardKnight,hailStoneHowler,primusShieldmaster1,primusShieldmaster2,ironcliffeGuardian]
    _.each(unitsToReceiveBuff, (unit) ->
      shamanContextObject = Modifier.createContextObjectWithAttributeBuffs(0,4)
      shamanContextObject.appliedName = i18next.t("modifiers.neutral_azure_horn_shaman_modifier")
      gameSession.applyModifierContextObject(shamanContextObject, unit)
    )
    # remove primus and do it again
    unitsToReceiveBuff = _.without(unitsToReceiveBuff,ironcliffeGuardian)
    _.each(unitsToReceiveBuff, (unit) ->
      shamanContextObject = Modifier.createContextObjectWithAttributeBuffs(0,4)
      shamanContextObject.appliedName = i18next.t("modifiers.neutral_azure_horn_shaman_modifier")
      gameSession.applyModifierContextObject(shamanContextObject, unit)
    )

    swampEntangler.setDamage(1)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_abyss_1_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedAbyssianChallenge1
