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

# http://forums.duelyst.com/t/vetruvia-test-of-knowledge/11390

class MediumVetruvianChallenge1 extends Challenge

  @type: "MediumVetruvianChallenge1"
  type: "MediumVetruvianChallenge1"
  categoryType: ChallengeCategory.vault2.type


  name: i18next.t("challenges.medium_vetruvian_1_title")
  description:i18next.t("challenges.medium_vetruvian_1_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.medium_vetruvian_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.medium_vetruvian_1_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 9
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Faction3.Dunecaster}
      {id: Cards.Spell.ScionsFirstWish}
      {id: Cards.Neutral.BloodtearAlchemist}
      {id: Cards.Neutral.Manaforger}
      {id: Cards.Spell.ScionsSecondWish}
      {id: Cards.Spell.StarsFury}
      {id: Cards.Spell.SiphonEnergy}
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
    general1.setPosition({x: 2, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-2)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25

    @applyCardToBoard({id: Cards.Faction3.PortalGuardian}, 3, 3, myPlayerId)

    @applyCardToBoard({id: Cards.Faction4.ShadowWatcher},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},4,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},6,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},6,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},7,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},8,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.Wraithling},8,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction4.SharianShadowdancer},8,0,opponentPlayerId)

    # mana orbs
    @applyCardToBoard({id: Cards.Tile.BonusMana},4,0)
    @applyCardToBoard({id: Cards.Tile.BonusMana},5,2)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.medium_vetruvian_1_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.7
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = MediumVetruvianChallenge1
