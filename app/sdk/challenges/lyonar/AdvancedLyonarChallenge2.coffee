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
_ = require 'underscore'
i18next = require('i18next')


# http://forums.duelyst.com/t/inspiring-presence-gate-7-slot-5/12982

class AdvancedLyonarChallenge2 extends Challenge

  @type: "AdvancedLyonarChallenge2"
  type: "AdvancedLyonarChallenge2"
  categoryType: ChallengeCategory.expert.type

  name: i18next.t("challenges.advanced_lyonar_2_title")
  description:i18next.t("challenges.advanced_lyonar_2_description")
  iconUrl: RSX.speech_portrait_lyonar_side.img

  _musicOverride: RSX.music_battlemap_songhai.audio

  otkChallengeStartMessage: i18next.t("challenges.advanced_lyonar_2_start")
  otkChallengeFailureMessages: [
    i18next.t("challenges.advanced_lyonar_2_fail")
  ]

  battleMapTemplateIndex: 1
  snapShotOnPlayerTurn: 0
  startingManaPlayer: CONFIG.MAX_MANA
  startingHandSizePlayer: 3

  constructor: ()->
    super()
    @hiddenUIElements = _.without(@hiddenUIElements, "SignatureCard")

  getMyPlayerDeckData: (gameSession)->
    return [
      {id: Cards.Faction1.General}
      {id: Cards.Neutral.SilhoutteTracer}
      {id: Cards.Artifact.SunstoneBracers}
      {id: Cards.Spell.Magnetize}
      {id: Cards.Artifact.IndomitableWill}
      {id: Cards.Spell.LionheartBlessing}
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
    general1.setPosition({x: 0, y:2})
    general1.maxHP = 25
    general1.setDamage(25-12)
    general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
    general2.setPosition({x: 7, y: 2})
    general2.maxHP = 25
    general2.setDamage(25-25)

    # set signature card to be always ready for this session
    gameSession.getPlayer1().setIsSignatureCardActive(true)

    @applyCardToBoard({id: Cards.Faction1.LysianBrawler},1,3,myPlayerId)
    @applyCardToBoard({id: Cards.Neutral.Manaforger},4,2,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.WindbladeAdept},3,1,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.WindbladeCommander},6,3,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.IroncliffeGuardian},3,2,myPlayerId)
    @applyCardToBoard({id: Cards.Faction1.WindbladeCommander},6,1,myPlayerId)

    @applyCardToBoard({id: Cards.Neutral.HailstoneHowler},2,2,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.WhistlingBlade},3,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Neutral.HailstoneHowler},4,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.CelestialPhantom},7,3,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.CelestialPhantom},7,1,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.Widowmaker},8,4,opponentPlayerId)
    @applyCardToBoard({id: Cards.Faction2.Widowmaker},8,0,opponentPlayerId)

  setupOpponentAgent: (gameSession) ->
    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:i18next.t("challenges.advanced_lyonar_2_taunt")
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))
    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = AdvancedLyonarChallenge2
