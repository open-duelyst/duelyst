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


# http://forums.duelyst.com/t/magmar-rampage/8452

class MediumMagmarChallenge1 extends Challenge

  @type: "MediumMagmarChallenge1"
  type: "MediumMagmarChallenge1"
  categoryType: ChallengeCategory.vault1.type

  name: i18next.t("challenges.medium_magmar_1_title")
  description:i18next.t("challenges.medium_magmar_1_description")
  iconUrl: RSX.speech_portrait_magmar.img

  _musicOverride: RSX.music_training.audio

  otkChallengeStartMessage: i18next.t("challenges.medium_magmar_1_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.medium_magmar_1_fail")
  ]

  battleMapTemplateIndex: 6
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 6

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction5.General}
      {id: Cards.Spell.FlashReincarnation}
      {id: Cards.Spell.Amplification}
      {id: Cards.Spell.FractalReplication}
      {id: Cards.Faction5.Elucidator}
      {id: Cards.Spell.DiretideFrenzy}
    ]

  getOpponentPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction6.General}
      {id: Cards.TutorialSpell.TutorialFrozenFinisher}
    ]

  setupBoard: (gameSession) ->
    super(gameSession)

    myPlayerId = gameSession.getMyPlayerId()
    opponentPlayerId = gameSession.getOpponentPlayerId()

    general1 = gameSession.getGeneralForPlayerId(myPlayerId)
    general1.setPosition({x: 2, y:2})
    general1.maxHP = 10
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 6, y: 2})
    general2.maxHP = 9

    @applyCardToBoard({id: Cards.Faction5.Kujata},1,2,myPlayerId)

    @applyCardToBoard({id: Cards.Faction6.ArcticRhyno},3,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.ArcticRhyno},3,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.FenrirWarmaster},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.FenrirWarmaster},4,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.ArcticDisplacer},5,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.PrismaticGiant},5,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.ArcticDisplacer},5,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},5,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},5,0,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},6,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction6.BlazingSpines},6,1,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.medium_magmar_1_taunt")
      isSpeech:true
      yPosition:.6
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = MediumMagmarChallenge1
