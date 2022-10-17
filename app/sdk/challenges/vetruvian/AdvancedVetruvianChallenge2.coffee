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

# http://forums.duelyst.com/t/wishful-thinking-gate-6-slot-5/12701

class AdvancedVetruvianChallenge2 extends Challenge

  @type: "AdvancedVetruvianChallenge2"
  type: "AdvancedVetruvianChallenge2"
  categoryType: ChallengeCategory.vault1.type


  name: i18next.t("challenges.advanced_vetruvian_2_title")
  description:i18next.t("challenges.advanced_vetruvian_2_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_vetruvian_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_vetruvian_2_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 2

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Spell.AstralPhasing}
      {id: Cards.Faction3.MirrorMaster}
      {id: Cards.Spell.ScionsSecondWish}
      {id: Cards.Spell.SiphonEnergy}
      {id: Cards.Spell.ScionsFirstWish}
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
    general1.setPosition({x: 3, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-15)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 0})
    general2.maxHP = 25
    general2.setDamage(25-8)

    scarab = @applyCardToBoard({id: Cards.Faction3.StarfireScarab}, 0, 4, myPlayerId)
    scarab.setDamage(1)

    @applyCardToBoard({id: Cards.Neutral.SaberspineTiger},3,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.RockPulverizer},6,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},7,2,opponentPlayerId)

    # mana orbs
    @applyCardToBoard({id: Cards.Tile.BonusMana},5,2)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    # Due to time maelstrom we don't know which turn the enemy general gets to finally act,
    # this will go away when we switch to resetting the otk on failure rather than ending turn and having a finisher
    for i in [0..5]
      @_opponentAgent.addActionForTurn(i,AgentActions.createAgentSoftActionShowInstructionLabels([
        label:i18next.t("challenges.advanced_vetruvian_2_taunt")
        isSpeech:true
        yPosition:.7
        isPersistent: true
        isOpponent: true
      ]))
      @_opponentAgent.addActionForTurn(i,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
        return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
      ).bind(this)))


module.exports = AdvancedVetruvianChallenge2
