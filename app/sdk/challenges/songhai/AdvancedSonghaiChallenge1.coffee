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


# http://forums.duelyst.com/t/stronger-scythe-otk-1/11401

class AdvancedSonghaiChallenge1 extends Challenge

  @type: "AdvancedSonghaiChallenge1"
  type: "AdvancedSonghaiChallenge1"
  categoryType: ChallengeCategory.contest1.type

  name: i18next.t("challenges.advanced_songhai_1_title")
  description:i18next.t("challenges.advanced_songhai_1_description")
  iconUrl: RSX.speech_portrait_songhai.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_songhai_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_songhai_1_fail")
  ]

  battleMapTemplateIndex: 2
  snapShotOnPlayerTurn: 0
  startingManaPlayer: 6
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction2.General}
      {id: Cards.Spell.Juxtaposition}
      {id: Cards.Spell.InnerFocus}
      {id: Cards.Spell.MistDragonSeal}
      {id: Cards.Artifact.MaskOfBloodLeech}
      {id: Cards.Spell.Juxtaposition}
      {id: Cards.Neutral.PhaseHound}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction3.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 5, y:3})
    general1.maxHP = 25
    general1.setDamage(25-7)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 8, y: 0})
    general2.maxHP = 25
    general2.setDamage(25-15)

    @applyCardToBoard({id: Cards.Neutral.SyvrelTheExile},4,2,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.DragoneboneGolem},6,2,myPlayerId)

    dioltas = @applyCardToBoard({id: Cards.Neutral.Dilotas},7,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},7,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},8,1,opponentPlayerId)

    @applyCardToBoard({id: Cards.Spell.DrainMorale},4,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Spell.CosmicFlesh},7,1,opponentPlayerId)
    dioltas.setDamage(dioltas.getMaxHP()-1)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_songhai_1_taunt")
      isSpeech:true
      isPersistent: true
      yPosition:.7
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedSonghaiChallenge1
