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
UtilsGameSession = require 'app/common/utils/utils_game_session'
i18next = require('i18next')

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class AdvancedVanarChallenge2 extends Challenge

  @type: "AdvancedVanarChallenge2"
  type: "AdvancedVanarChallenge2"
  categoryType: ChallengeCategory.vault2.type

  name: i18next.t("challenges.advanced_vanar_2_title")
  description:i18next.t("challenges.advanced_vanar_2_description")
  iconUrl: RSX.speech_portrait_vanar.img

  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_vanar_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_vanar_2_fail")
  ]

  battleMapTemplateIndex: 3
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Neutral.PrimusFist}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Neutral.FirstSwordofAkrane}
      {id: Cards.Spell.RitualOfTheWind}
      {id: Cards.Spell.AspectOfTheWolf}
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
    general1.setPosition({x: 4, y:0})
    general1.maxHP = 25
    general1.setDamage(25-13)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 4, y: 2})
    general2.maxHP = 25

    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 3, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines}, 3, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 3, 1, myPlayerId)

    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 4, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 4, 1, myPlayerId)

    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 5, 3, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines}, 5, 2, myPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BonechillBarrier}, 5, 1, myPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_vanar_2_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedVanarChallenge2
