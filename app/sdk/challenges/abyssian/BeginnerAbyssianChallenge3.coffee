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


# http://forums.duelyst.com/t/abyss-super-creep-medium/8970

class BeginnerAbyssianChallenge3 extends Challenge

  @type: "BeginnerAbyssianChallenge3"
  type: "BeginnerAbyssianChallenge3"
  categoryType: ChallengeCategory.advanced.type

  name:i18next.t("challenges.beginner_abyss_3_title")
  description:i18next.t("challenges.beginner_abyss_3_description")
  iconUrl: RSX.speech_portrait_abyssian.img

  _musicOverride: RSX.music_battlemap_abyssian.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_abyss_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_abyss_3_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.Spell.WraithlingSwarm}
      {id: Cards.Spell.DaemonicLure}
      {id: Cards.Artifact.HornOfTheForsaken}
      {id: Cards.Spell.AbyssianStrength}
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
    general1.setPosition({x: 1, y: 2})
    general1.maxHP = 25
    general1.setDamage(18)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-14)

    @applyCardToBoard({id: Cards.Faction4.Wraithling}, 2, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction4.GloomChaser}, 2, 1, myPlayerId)
    blackSolus = @applyCardToBoard({id: Cards.Faction4.BlackSolus}, 4, 2, myPlayerId)
    buffSolusModifier = blackSolus.getModifierByType(ModifierSummonWatchByEntityBuffSelf.type)
    buffSolusModifier.applyManagedModifiersFromModifiersContextObjects(buffSolusModifier.modifiersContextObjects, blackSolus)

    goreHorn = @applyCardToBoard({id: Cards.Faction2.GoreHorn},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.MistDragonSeal},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.KaidoAssassin},6,2,opponentPlayerId)
    @applyCardToBoard(goreHorn.getCurrentFollowupCard(),5,2,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_abyss_3_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerAbyssianChallenge3
