Challenge     = require("app/sdk/challenges/challenge")
GameSession   = require 'app/sdk/gameSession'
FactionFactory   = require 'app/sdk/cards/factionFactory'
AgentActions   = require 'app/sdk/agents/agentActions'
RSX       = require('app/data/resources')
BattleMapTemplate = require 'app/sdk/battleMapTemplate'
fetch = require 'isomorphic-fetch'
Promise = require 'bluebird'
i18next = require 'i18next'

class ChallengeRemote extends Challenge

  @type: "rando-1"
  type: "rando-1"
  categoryType: null
  isDaily: true

  name:"<name>",
  description:"<description>",
  iconUrl: RSX.speech_portrait_vanar.img
  _musicOverride: RSX.music_battlemap_vanar.audio

  otkChallengeStartMessage: "<instructions>"
  otkChallengeFailureMessages: [
    "Hint:..."
  ]

  snapShotOnPlayerTurn: 0
  _gameSessionData: null

  @loadAndCreateFromModelData:(modelAttributes)->
    return Promise.resolve(fetch(modelAttributes.url))
    .bind(this)
    .timeout(10000)
    .catch(@_networkError)
    .then (res)->
      if res.ok
        return res.json()
      else
        err = new Error(res.statusText)
        err.status = res.status
        throw err
    .then (data) =>
      return @.createFromGameSessionData(modelAttributes,data)

  @createFromGameSessionData:(modelAttributes,data)->
    challenge = new ChallengeRemote(data)
    challenge.type = modelAttributes.challenge_id
#    challenge.name = modelAttributes.title
#    challenge.description = modelAttributes.description
    challenge.name = i18next.t("challenges.daily_challenge_label")
    opponentFactionName = "enemy"
    if (data?.gameSetupData?.players?[1]?.factionId?)
      opponentFullFactionName = FactionFactory.factionForIdentifier(data.gameSetupData.players[1].factionId).name
      opponentFactionName = opponentFullFactionName.split(" ")[0]
    challenge.goldReward = modelAttributes.gold
    #challenge.description = "Defeat the #{opponentFactionName} General in ONE turn."
    challenge.description = i18next.t("challenges.daily_challenge_desc",{faction:@opponentFactionName})
    challenge.otkChallengeStartMessage = modelAttributes.instructions
#    challenge.otkChallengeFailureMessages = [modelAttributes.hint]
    challenge.otkChallengeFailureMessages = []

    # This is only present when a challenge is loaded from QA tool by date, NOT INTENDED FOR OTHER USE
    challenge.dateKey = modelAttributes.dateKey

    # Set up iconUrl
    if (data?.gameSetupData?.players?[0]?.generalId?)
      generalId = data.gameSetupData.players[0].generalId
      generalSdkCard = GameSession.getCardCaches().getCardById(generalId)
      generalSpeechResource = generalSdkCard.getSpeechResource()
      if generalSpeechResource?
        challenge.iconUrl = generalSpeechResource.img

    return Promise.resolve(challenge)

  constructor:(data)->
    super()

    @hiddenUIElements = _.without(@hiddenUIElements, "SignatureCard")

    @_gameSessionData = data

  ###*
  # Set up the GameSession for this challenge.
  # @public
  ###
  setupSession:(gameSession, player1Data, player2Data)->

    # overwrite players names
    @_gameSessionData.players[0].username = i18next.t("challenges.challenge_p1_label")
    @_gameSessionData.players[1].username = i18next.t("challenges.challenge_p2_label")


    gameSession.deserializeSessionFromFirebase(@_gameSessionData)

    gameSession.setUserId(gameSession.getPlayer1Id())

    # set game session challenge
    gameSession.setChallenge(@)

    # set modes
    @setupSessionModes(gameSession)

    # Disable ability to replace
    player1 = gameSession?.getPlayer1()
    deck = player1?.getDeck()
    if deck?
      deck.setNumCardsReplacedThisTurn(1)

    # set battlemap template
    if @battleMapTemplateIndex?
      gameSession.setBattleMapTemplate(new BattleMapTemplate(gameSession, @battleMapTemplateIndex))

    # setup agent
    @setupOpponentAgent(gameSession)

    # force game session to sync state
    # in case any challenges set custom board state or stats
    gameSession.syncState()

    currentTurnIndex = GameSession.current().getNumberOfTurns() # current turn count calculation is ugly
    playersTurnIndex = Math.floor(currentTurnIndex / 2) # represents the index of turn for this player

    @snapShotOnPlayerTurn = playersTurnIndex

    # snapshot complete session
    @_snapShotChallengeIfNeeded()

    return gameSession

  ###*
  # Set up the Oppponent Agent action for this challenge.
  # @public
  ###
  setupOpponentAgent: (gameSession) ->

    super(gameSession)

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
      label:"Say your prayers."
      isSpeech:true
      yPosition:.7
      isPersistent: true
      isOpponent: true
    ]))

    @_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
      return [gameSession.getGeneralForPlayer1().getPosition()]
    ).bind(this)))


module.exports = ChallengeRemote
