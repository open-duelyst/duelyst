CONFIG = require 'app/common/config'
Logger = require 'app/common/logger'
UtilsJavascript = require 'app/common/utils/utils_javascript'
GameType = require './gameType'
PlayCardSilentlyAction = require './actions/playCardSilentlyAction'
Entity = require './entities/entity'
Cards = require './cards/cardsLookupComplete'
BattleMapTemplate = require './battleMapTemplate'
CosmeticsFactory = require './cosmetics/cosmeticsFactory'
ModifierStartsInHand = require 'app/sdk/modifiers/modifierStartsInHand'
_ = require("underscore")

GameSetup = {}

# region SETUP NEW

###*
# Initialize new game session object with the correct data
# @public
# @param gameSession
# @param player1Data
# @param player2Data
# @example
# playerData should contain:
#    userId: String
#    name: String
#    deck: Array of [{ id: Integer }]
###
GameSetup.setupNewSession = (gameSession, player1Data, player2Data, withoutManaTiles=false) ->
  if gameSession?
    #Logger.module("SDK").debug("[G:#{gameSession.gameId}]", "GameSetup.setupNewSession", player1Data, player2Data)
    #Logger.module("SDK").debug("GameSetup: player 1 battlemap indexes -> #{player1Data.battleMapIndexes}")



    # get players
    player1 = gameSession.getPlayer1()
    player2 = gameSession.getPlayer2()

    # setup basics
    GameSetup.setupPlayerBasics(gameSession, player1, player1Data)
    GameSetup.setupPlayerBasics(gameSession, player2, player2Data)

    # first card from the deck should always be the general
    general1CardData = UtilsJavascript.deepCopy(player1Data.deck[0])
    general2CardData = UtilsJavascript.deepCopy(player2Data.deck[0])

    # always setup general before decks or cards
    general1 = GameSetup.createGeneral(gameSession, player1, general1CardData)
    general2 = GameSetup.createGeneral(gameSession, player2, general2CardData)

    if general1.getBossBattleBattleMapIndex()?
      battemapTemplateIndex = general1.getBossBattleBattleMapIndex()
      Logger.module("SDK").debug("GameSetup: player 1 boss battlemap index -> #{battemapTemplateIndex}")
      gameSession.battleMapTemplate = new BattleMapTemplate(gameSession, battemapTemplateIndex)
    else if general2.getBossBattleBattleMapIndex()?
      battemapTemplateIndex = general2.getBossBattleBattleMapIndex()
      Logger.module("SDK").debug("GameSetup: player 2 boss battlemap index -> #{battemapTemplateIndex}")
      gameSession.battleMapTemplate = new BattleMapTemplate(gameSession, battemapTemplateIndex)
    else if player1Data.battleMapIndexes?
      battemapTemplateIndex = _.sample(player1Data.battleMapIndexes)
      Logger.module("SDK").debug("GameSetup: player 1 battlemap index -> #{battemapTemplateIndex}")
      gameSession.battleMapTemplate = new BattleMapTemplate(gameSession, battemapTemplateIndex)

    # setup decks
    GameSetup.setupDeck(gameSession, player1)
    GameSetup.setupDeck(gameSession, player2)

    # always add general before adding cards but after setting up deck
    # because general may attempt to access deck and cards may attempt to add modifiers to the general
    general1Position = player1Data.startingGeneralPosition
    if general1Position?
      general1X = general1Position.x
      general1Y = general1Position.y
    if !general1X? then general1X = 0
    if !general1Y? then general1Y = 2
    GameSetup.addGeneral(gameSession, player1, general1, general1X, general1Y)

    general2Position = player2Data.startingGeneralPosition
    if general2Position?
      general2X = general2Position.x
      general2Y = general2Position.y
    if !general2X? then general2X = 8
    if !general2Y? then general2Y = 2
    GameSetup.addGeneral(gameSession, player2, general2, general2X, general2Y)

    # setup cards in decks and hands
    GameSetup.addCardsToDeck(gameSession, player1, player1Data, player1Data.deck)
    GameSetup.addCardsToDeck(gameSession, player2, player2Data, player2Data.deck)

    if !withoutManaTiles
      # create and apply special tiles
      gameSession.applyCardToBoard(gameSession.getExistingCardFromIndexOrCreateCardFromData({id: Cards.Tile.BonusMana}), 4, 0)
      gameSession.applyCardToBoard(gameSession.getExistingCardFromIndexOrCreateCardFromData({id: Cards.Tile.BonusMana}), 4, 4)
      gameSession.applyCardToBoard(gameSession.getExistingCardFromIndexOrCreateCardFromData({id: Cards.Tile.BonusMana}), 5, 2)

    GameSetup.addCardsToBoard(gameSession, player1Data.startingBoardCardsData, player1)
    GameSetup.addCardsToBoard(gameSession, player2Data.startingBoardCardsData, player2)

    # store game setup data for things like replays
    # this way game can be re-setup exactly as it was after new setup
    gameSession.gameSetupData = GameSetup.createGameSetupData(gameSession, player1Data, player2Data)

GameSetup.setupPlayerBasics = (gameSession, player, playerData) ->
  # store player properties
  player.setPlayerId(playerData.userId)
  player.setUsername(playerData.name)
  player.setIsRanked(playerData.gameType == GameType.Ranked)
  if player.getIsRanked()
    player.setRank(playerData.rank)
  if playerData.startingMana? then player.setStartingMana(playerData.startingMana)

GameSetup.createGeneral = (gameSession, player, generalCardData) ->
  # create general
  general = gameSession.getExistingCardFromIndexOrCreateCardFromData(generalCardData)
  general.setOwner(player)
  return general

GameSetup.addGeneral = (gameSession, player, general, generalX, generalY) ->
  # apply general
  gameSession.applyCardToBoard(general, generalX, generalY)
  general.refreshExhaustion()

  # add signature card
  signatureCardData = player.getSignatureCardData()
  if signatureCardData?
    signatureCard = gameSession.getExistingCardFromIndexOrCreateCardFromData(signatureCardData)
    if signatureCard?
      signatureCard.setOwner(player)
      gameSession.applyCardToSignatureCards(signatureCard, signatureCardData)

  # set signature card as inactive
  player.setIsSignatureCardActive(false)

GameSetup.setupDeck = (gameSession, player) ->
  playerDeck = player.getDeck()

  # store deck properties
  playerDeck.setOwnerId(player.getPlayerId())

GameSetup.addCardsToDeck = (gameSession, player, playerData, playerCardsData) ->
  if playerCardsData?
    playerDeck = player.getDeck()

    # copy cards data
    playerCardsData = UtilsJavascript.deepCopy(playerCardsData)

    # remove first as it should always be general
    playerCardsData.shift()

    # change starting hand size as needed
    if playerData.startingHandSize?
      playerStartingHandSize = Math.max(0, playerData.startingHandSize)
    else
      playerStartingHandSize = CONFIG.STARTING_HAND_SIZE

    # now check for a Starts In Player Hand card, and if found, insert it at end of starting end
    for cardData, index in playerCardsData
      card = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData)
      if card? and card.hasModifierClass(ModifierStartsInHand)
        playerCardsData.splice(index, 1)
        card.setOwner(player)
        gameSession.applyCardToHand(playerDeck, cardData, card, playerStartingHandSize)
        break


    # add cards to hand
    for i in [0...playerStartingHandSize]
      if !gameSession.getAreDecksRandomized()
        index = playerCardsData.length - 1
      else
        index = Math.floor(Math.random() * playerCardsData.length)
      cardData = playerCardsData.splice(index, 1)[0]
      card = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData)
      if card?
        card.setOwner(player)
        gameSession.applyCardToHand(playerDeck, cardData, card)

    # add cards to decks
    for cardData in playerCardsData
      card = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData)
      if card?
        card.setOwner(player)
        gameSession.applyCardToDeck(playerDeck, cardData, card)

GameSetup.addCardsToBoard = (gameSession, boardCardsData, owner) ->
  if boardCardsData?
    # copy cards data so we don't modify anything unintentionally
    boardCardsData = UtilsJavascript.deepCopy(boardCardsData)

    # add all cards to board
    for cardData in boardCardsData
      card = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData)
      if card?
        # extract card data that should not be copied into card
        position = cardData.position
        delete cardData.position

        # set owner as needed
        # otherwise defaults to ownerId on card data or game session
        if owner?
          delete cardData.ownerId
          card.setOwner(owner)

        # apply to board
        gameSession.applyCardToBoard(card, position.x, position.y, cardData)

        if card instanceof Entity
          card.refreshExhaustion()

# endregion SETUP NEW

# region SETUP FROM DATA

GameSetup.setupNewSessionFromExistingSessionData = (gameSession, existingGameSessionData) ->
  # store game setup data
  gameSetupData = existingGameSessionData.gameSetupData
  gameSession.gameSetupData = gameSetupData

  # apply battlemap data
  gameSession.getBattleMapTemplate().deserialize(existingGameSessionData.battleMapTemplate)

  # get players and setup data
  player1 = gameSession.getPlayer1()
  player1SetupData = gameSetupData.players[0]
  player2 = gameSession.getPlayer2()
  player2SetupData = gameSetupData.players[1]

  # setup players
  GameSetup.setupPlayerFromData(gameSession, player1, player1SetupData)
  GameSetup.setupPlayerFromData(gameSession, player2, player2SetupData)

  # setup players
  GameSetup.addCardsToDeckFromData(gameSession, player1, player1SetupData)
  GameSetup.addCardsToDeckFromData(gameSession, player2, player2SetupData)

  # add all cards to board
  GameSetup.addCardsToBoard(gameSession, gameSetupData.boardCardsData)

GameSetup.setupPlayerFromData = (gameSession, player, playerGameSetupData) ->
  GameSetup.setupPlayerBasics(gameSession, player, playerGameSetupData)
  GameSetup.setupDeck(gameSession, player)

GameSetup.addCardsToDeckFromData = (gameSession, player, playerGameSetupData) ->
  playerDeck = player.getDeck()

  # add cards to decks
  for cardData in playerGameSetupData.startingDrawPile
    gameSession.applyCardToDeck(playerDeck, cardData, gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData))

  # add cards to hand
  for cardData in playerGameSetupData.startingHand
    if cardData?
      gameSession.applyCardToHand(playerDeck, cardData, gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData))

# endregion SETUP FROM DATA

# region GAME SETUP DATA

GameSetup.createGameSetupData = (gameSession, player1Data, player2Data) ->
  gameSetupData = {}

  # snapshot all cards on board
  gameSetupData.boardCardsData = []
  for card in gameSession.getBoard().getCards(null, allowUntargetable=true)
    gameSetupData.boardCardsData.push(card.createGameSetupCardData())

  # snapshot player data
  gameSetupData.players = []
  player1 = gameSession.getPlayer1()
  gameSetupData.players[0] = GameSetup.createGameSetupDataForPlayer(gameSession, player1, player1Data)
  player2 = gameSession.getPlayer2()
  gameSetupData.players[1] = GameSetup.createGameSetupDataForPlayer(gameSession, player2, player2Data)

  return gameSetupData

GameSetup.createGameSetupDataForPlayer = (gameSession, player, playerData) ->
  playerDeck = player.getDeck()
  playerGeneral = gameSession.getGeneralForPlayer(player)
  playerGameSetupData = {}

  # player data
  playerGameSetupData.playerId = player.getPlayerId()
  playerGameSetupData.userId = playerGameSetupData.playerId
  playerGameSetupData.cardBackId = playerData.cardBackId
  playerGameSetupData.battleMapIndexes = playerData.battleMapIndexes
  playerGameSetupData.name = player.getUsername()
  playerGameSetupData.isRanked = player.getIsRanked()
  playerGameSetupData.factionId = playerGeneral.getFactionId()
  playerGameSetupData.generalId = playerGeneral.getId()
  playerGameSetupData.startingMana = player.getStartingMana()
  if (playerData.ticketId)
    playerGameSetupData.ticketId = playerData.ticketId
  if (playerData.riftRating?)
    playerGameSetupData.riftRating = playerData.riftRating

  # store copies of decks to preserve original data
  playerGameSetupData.deck = UtilsJavascript.deepCopy(playerData.deck)

  # store copies of starting cards in deck to preserve original data
  playerGameSetupData.startingDrawPile = _.map(playerDeck.getCardsInDrawPile(), (card) ->
    return card.createGameSetupCardData()
  )

  # store copies of starting cards in hand to preserve original data
  playerGameSetupData.startingHand = _.map(playerDeck.getCardsInHand(), (card) ->
    if card?
      return card.createGameSetupCardData()
    else
      return null
  )

  return playerGameSetupData

# endregion GAME SETUP DATA

module.exports = GameSetup
