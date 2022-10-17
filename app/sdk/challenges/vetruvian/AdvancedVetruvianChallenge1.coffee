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
ModifierDeathWatchBuffSelf = require('app/sdk/modifiers/modifierDeathWatchBuffSelf')
i18next = require('i18next')

# http://forums.duelyst.com/t/patience-otk-1/11413

class AdvancedVetruvianChallenge1 extends Challenge

  @type: "AdvancedVetruvianChallenge1"
  type: "AdvancedVetruvianChallenge1"
  categoryType: ChallengeCategory.contest1.type


  name: i18next.t("challenges.advanced_vetruvian_1_title")
  description:i18next.t("challenges.advanced_vetruvian_1_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_vetruvian_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_vetruvian_1_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 4
  usesResetTurn: false

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Neutral.PrimusFist}
      {id: Cards.Neutral.LadyLocke}
      {id: Cards.Spell.ScionsSecondWish}
      {id: Cards.Faction3.BrazierGoldenFlame}
      {id: Cards.Artifact.AnkhFireNova}
      {id: Cards.Artifact.StaffOfYKir}
      {id: Cards.Spell.Maelstrom}
      {id: Cards.Spell.ScionsThirdWish}
      {id: Cards.Neutral.Manaforger}
      {id: Cards.Spell.StarsFury}
      {id: Cards.Spell.Enslave}
      {id: Cards.Spell.Maelstrom}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction4.General}
      {id: Cards.TutorialSpell.TutorialFireOrb}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 0, y: 4})
    general1.maxHP = 25
    general1.setDamage(25-2)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 5, y: 2})
    general2.maxHP = 25

    @applyCardToBoard({id: Cards.Faction3.Oserix}, 8, 0, myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},5,0,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},7,2,myPlayerId)

    @applyCardToBoard({id: Cards.Faction4.SharianShadowdancer},1,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},2,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.NightsorrowAssassin},3,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.SharianShadowdancer},5,4,opponentPlayerId)

    # equip grimwar to lilith
    grimwar = @applyCardToBoard({id: Cards.Artifact.SoulGrimwar},5,2,opponentPlayerId)
    # buff lilithe from grimwar
    grimwarModifier = general2.getModifierByType(ModifierDeathWatchBuffSelf.type)
    grimwarModifier.applyManagedModifiersFromModifiersContextObjects(grimwarModifier.modifiersContextObjects, general2)
    grimwarModifier.applyManagedModifiersFromModifiersContextObjects(grimwarModifier.modifiersContextObjects, general2)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    # Due to time maelstrom we don't know which turn the enemy general gets to finally act,
    # this will go away when we switch to resetting the otk on failure rather than ending turn and having a finisher
    for i in [0..5]
      @_opponentAgent.addActionForTurn(i,AgentActions.createAgentSoftActionShowInstructionLabels([
        label:i18next.t("challenges.advanced_vetruvian_1_taunt")
        isSpeech:true
        yPosition:.7
        isPersistent: true
        isOpponent: true
      ]))
      @_opponentAgent.addActionForTurn(i,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
        return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
      ).bind(this)))


module.exports = AdvancedVetruvianChallenge1
