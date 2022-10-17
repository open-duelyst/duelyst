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
ModifierSpellWatchBuffAlliesByRace = require('app/sdk/modifiers/modifierSpellWatchBuffAlliesByRace')
i18next = require('i18next')


# http://forums.duelyst.com/t/mind-game-otk-1/11425

class AdvancedMagmarChallenge1 extends Challenge

  @type: "AdvancedMagmarChallenge1"
  type: "AdvancedMagmarChallenge1"
  categoryType: ChallengeCategory.contest2.type

  name: i18next.t("challenges.advanced_magmar_1_title")
  description:i18next.t("challenges.advanced_magmar_1_description")
  iconUrl: RSX.speech_portrait_magmar.img

  _musicOverride: RSX.music_training.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_magmar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_magmar_1_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 6
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.Neutral.AlcuinLoremaster}
      {id: Cards.Neutral.AlcuinLoremaster}
      {id: Cards.Neutral.AlcuinLoremaster}
      {id: Cards.Spell.EggMorph}
      {id: Cards.Neutral.ZenRui}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 4, y:2})
    general1.maxHP = 25
    general1.setDamage(25-1)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 1})
    general2.maxHP = 25
    general2.setDamage(25-14)

    @applyCardToBoard({id: Cards.Faction5.Kujata},0,4,myPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Kujata},0,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Kujata},0,2,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},0,1,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},0,0,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},1,0,myPlayerId)
    @applyCardToBoard({id: Cards.Faction2.MageOfFourWinds},2,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction5.Vindicator},3,1,myPlayerId)

    songweaver1 = @applyCardToBoard({id: Cards.Neutral.Songweaver},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.OwlbeastSage},6,2,opponentPlayerId)
    owlbeast = @applyCardToBoard({id: Cards.Neutral.OwlbeastSage},6,0,opponentPlayerId)
    songweaver2 = @applyCardToBoard({id: Cards.Neutral.Songweaver},7,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.ScarletViper},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.Heartseeker},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.Heartseeker},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.HealingMystic},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.DragoneboneGolem},3,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.VenomToth},8,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.TuskBoar},3,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.StormKage},6,3,opponentPlayerId)
    # apply Killing Edge buff to Storm Kage
    @applyCardToBoard({id: Cards.Spell.KillingEdge},6,3,opponentPlayerId)
    # apply empty mana tile for Mana Burn to target
    manaTile1 = @applyCardToBoard({id: Cards.Tile.BonusMana}, 4, 4)
    manaTile1.getModifierByType("ModifierCollectableBonusMana").onDepleted()



  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_magmar_1_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedMagmarChallenge1
