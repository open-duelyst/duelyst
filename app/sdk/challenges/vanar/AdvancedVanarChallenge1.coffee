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

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class AdvancedVanarChallenge1 extends Challenge

  @type: "AdvancedVanarChallenge1"
  type: "AdvancedVanarChallenge1"
  categoryType: ChallengeCategory.contest2.type

  name: i18next.t("challenges.advanced_vanar_1_title")
  description:i18next.t("challenges.advanced_vanar_1_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_vanar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_vanar_1_fail")
  ]

  battleMapTemplateIndex: 3
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Spell.AspectOfTheWolf}
      {id: Cards.Spell.IceCage}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Spell.IceCage}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Neutral.ZenRui}
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
    general1.setPosition({x: 7, y:0})
    general1.maxHP = 25
    general1.setDamage(25-1)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 1, y: 4})
    general2.maxHP = 25
    general2.setDamage(25-7)

    @applyCardToBoard({id: Cards.Neutral.Manaforger}, 5, 1, myPlayerId)
    # buff mana forger
    @applyCardToBoard({id: Cards.Spell.PermafrostShield},5,1,myPlayerId)

    @applyCardToBoard({id: Cards.Faction6.HearthSister}, 8, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger}, 8, 1, myPlayerId)
    #@applyCardToBoard({id: Cards.Neutral.Manaforger}, 8, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.ArcticRhyno}, 8, 0, myPlayerId)


    ladyLocke = @applyCardToBoard({id: Cards.Neutral.LadyLocke},2,4,opponentPlayerId)
    chakri1 = @applyCardToBoard({id: Cards.Faction2.ChakriAvatar},1,2,opponentPlayerId)
    manaForger = @applyCardToBoard({id: Cards.Neutral.Manaforger},2,3,opponentPlayerId)
    owlbeast = @applyCardToBoard({id: Cards.Neutral.OwlbeastSage},2,2,opponentPlayerId)
    chakri2 = @applyCardToBoard({id: Cards.Faction2.ChakriAvatar},3,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.LadyLocke},2,1,opponentPlayerId)

    # give lady lockes buffs to enemy manaforger, owlbeast, and both chakris
    lockPlayerModifier = ladyLocke.getModifierByType(ModifierOpeningGambitApplyPlayerModifiers.type)
    for modifierContextObject in lockPlayerModifier.modifiersContextObjects[0].modifiersContextObjects
      gameSession.applyModifierContextObject(modifierContextObject, chakri1)
    for modifierContextObject in lockPlayerModifier.modifiersContextObjects[0].modifiersContextObjects
      gameSession.applyModifierContextObject(modifierContextObject, manaForger)
    for modifierContextObject in lockPlayerModifier.modifiersContextObjects[0].modifiersContextObjects
      gameSession.applyModifierContextObject(modifierContextObject, owlbeast)
    for modifierContextObject in lockPlayerModifier.modifiersContextObjects[0].modifiersContextObjects
      gameSession.applyModifierContextObject(modifierContextObject, chakri2)

    # mana orbs
    @applyCardToBoard({id: Cards.Tile.BonusMana},4,0)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_vanar_1_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedVanarChallenge1
