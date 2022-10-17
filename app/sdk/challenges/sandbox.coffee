Challenge = require './challenge'
GameSetup = require './../gameSetup'
GameType = require 'app/sdk/gameType'
PlayModeFactory = require './../playModes/playModeFactory'
PlayModes = require './../playModes/playModesLookup'

class Sandbox extends Challenge

  @type: "Sandbox"
  type: "Sandbox"

  name: PlayModeFactory.playModeForIdentifier(PlayModes.Sandbox).name
  description: PlayModeFactory.playModeForIdentifier(PlayModes.Sandbox).description

  battleMapTemplateIndex: null # sandbox can use random battle maps

  player1Deck: null
  player2Deck: null
  skipMulligan: false
  customBoard: false

  setPlayer1DeckData: (player1Deck) ->
    @player1Deck = player1Deck

  getMyPlayerDeckData: () ->
    return @player1Deck

  setPlayer2DeckData: (player2Deck) ->
    @player2Deck = player2Deck

  getOpponentPlayerDeckData: () ->
    return @player2Deck

  setupSession:(gameSession)->
    return super(gameSession, {
      userId: gameSession.getUserId()
      name: "Player 1"
    }, {
      userId: gameSession.getUserId() + "test"
      name: "Player 2"
    })

  setupSessionModes: (gameSession) ->
    super(gameSession)
    gameSession.setGameType(GameType.Sandbox)

  setupOpponentAgent: () ->
    # no agent needed for sandbox

module.exports = Sandbox
