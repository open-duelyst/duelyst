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

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class BeginnerVetruvianChallenge3 extends Challenge

  @type: "BeginnerVetruvianChallenge3"
  type: "BeginnerVetruvianChallenge3"
  categoryType: ChallengeCategory.keywords.type


  name: i18next.t("challenges.beginner_vetruvian_3_title")
  description:i18next.t("challenges.beginner_vetruvian_3_description")
  iconUrl: RSX.speech_portrait_vetruvian.img

  _musicOverride: RSX.music_battlemap_vetruv.audio

  otkChallengeStartMessage: i18next.t("challenges.beginner_vetruvian_3_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.beginner_vetruvian_3_fail")
  ]

  battleMapTemplateIndex: 0
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 4
  startingHandSizePlayer: 4

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.Neutral.EphemeralShroud}
      {id: Cards.Neutral.Maw}
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
    general1.setPosition({x: 3, y: 2})
    general1.maxHP = 25
    general1.setDamage(25-3)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-2)

    @applyCardToBoard({id: Cards.Tile.Shadow},4,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},4,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Tile.Shadow},5,0,opponentPlayerId)

    shadowWatcher = @applyCardToBoard({id: Cards.Faction4.ShadowWatcher},5,2,opponentPlayerId)
    shadowWatcherModifier = shadowWatcher.getModifierByType(ModifierDeathWatchBuffSelf.type)
    for i in [0...4]
      shadowWatcherModifier.applyManagedModifiersFromModifiersContextObjects(shadowWatcherModifier.modifiersContextObjects, shadowWatcher)


  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.beginner_vetruvian_3_taunt")
      isSpeech:true
      isPersistent:true
      yPosition:.6
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = BeginnerVetruvianChallenge3
