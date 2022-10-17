###
AnalyticsTracker - Parses through events passed to it to track analytics
  - This is not meant to listen to events directly,
  - these events should be called from other UI managers to reduce listener spaghetti
###

Analytics = require('app/common/analytics')
SDK =       require('app/sdk')
Logger =     require('app/common/logger')
moment =     require('moment')
CONFIG =    require('app/common/config')

class AnalyticsTracker

  # Sends the analytics pulled from the end of game
  @submitGameOverAnalytics: (gameSession,gameOverData) ->
    if !@_sendAnalyticsForCurrentGameSession()
      return

    myPlayerId = gameSession.getMyPlayerId()

    if (!gameSession.isOver())
      return

    # general analytics data
    playerSetupData = gameSession.getPlayerSetupDataForPlayerId(myPlayerId)
    factionId = playerSetupData.factionId
    factionName = SDK.FactionFactory.factionForIdentifier(factionId).name
    opponentSetupData = gameSession.getPlayerSetupDataForPlayerId(gameSession.getOpponentPlayerId())
    opponentFactionId = opponentSetupData.factionId
    opponentFactionName = SDK.FactionFactory.factionForIdentifier(opponentFactionId).name

    myPlayer = gameSession.getMyPlayer()
    opponentPlayer = gameSession.getOpponentPlayer()
    wasVictory = myPlayer.getIsWinner()
    wasDraw = not (myPlayer.getIsWinner() || opponentPlayer.getIsWinner())

    # Prep of transmitted data
    isFirstMover = if (myPlayer.playerId == gameSession.getPlayer1().playerId) then 1 else 0
    gameOutcome = if (wasDraw) then 0 else if wasVictory then 1 else -1
    isScored = if (gameOverData.get("is_scored")) then 1 else 0
    didConcede = if myPlayer.hasResigned  then 1 else 0
    generalId = SDK.Cards.getBaseCardId(playerSetupData.generalId)
    opponentGeneralId = SDK.Cards.getBaseCardId(opponentSetupData.generalId)

      # Game duration stats
    now = moment()
    lastActionInGame = new moment(gameSession.lastActionTimestamp)
    since = moment(gameSession.createdAt)
    duration = moment.duration(lastActionInGame.diff(since))
    deckSpiritCost = _.reduce(playerSetupData.deck, (memo, card) ->
      card = SDK.CardFactory.cardForIdentifier(card.id,gameSession)
      cardRarityId = card.getRarityId()
      rarityData = SDK.RarityFactory.rarityForIdentifier(cardRarityId)
      return memo + rarityData.spiritCost
    ,0)

    Analytics.setGroupPriority(Analytics.EventPriority.Optional)

    Analytics.track("played game", {
      category:Analytics.EventCategory.Game
      duration:Math.floor(duration.asSeconds())
      turn_count:gameSession.getNumberOfTurns()
      game_type:gameSession.gameType
      game_id: gameSession.getGameId()
      game_outcome: gameOutcome,
      is_first_mover: isFirstMover
      is_scored: isScored
      did_concede: didConcede
      deck_spirit_cost: deckSpiritCost
      faction_id: factionId
      general_id: generalId,
      opponent_faction_id:opponentFactionId,
      opponent_general_id:opponentGeneralId
    },{
      nonInteraction:1
    })

    Analytics.clearGroupPriority()



  @sendAnalyticsForExplicitAction: (action) ->
    if !@_sendAnalyticsForCurrentGameSession()
      return

    gameSession = SDK.GameSession.current()

    Analytics.setGroupPriority(Analytics.EventPriority.Optional)
    if action.getType() == SDK.PlayCardFromHandAction.type && action.getOwnerId() == gameSession.getMyPlayerId()
      card = action.getCard()
      cardType = card.getType()
      Analytics.track("played card", {
        category: Analytics.EventCategory.Game,
        game_id: gameSession.getGameId(),
        card_id: card.getBaseCardId(),
        turn_index: gameSession.getNumberOfTurns()
      })
    else if action instanceof SDK.ReplaceCardFromHandAction && action.getOwnerId() == gameSession.getMyPlayerId()
      # track analytics for valid replace when coming from my player
      replacedCard = action.getCard()
      if replacedCard
        Analytics.track("replace card", {
          category: Analytics.EventCategory.Game,
          game_id: gameSession.getGameId(),
          card_id: replacedCard.getBaseCardId(),
          turn_index: gameSession.getNumberOfTurns()
        })
    else if action instanceof SDK.DrawStartingHandAction && action.getOwnerId() == gameSession.getMyPlayerId()
      mulliganedCardData = action.mulliganedHandCardsData
      if mulliganedCardData?
        for cardData in mulliganedCardData
          card = SDK.GameSession.getCardCaches().getCardById(cardData.id)
          Analytics.track("mulliganed card", {
            category: Analytics.EventCategory.Game,
            game_id: gameSession.getGameId(),
            card_id: card.getBaseCardId()
          })

    Analytics.clearGroupPriority()

  @sendAnalyticsForCompletedTurn: (turn) ->
    if !@_sendAnalyticsForCurrentGameSession()
      return

    gameSession = SDK.GameSession.current()
    playerForTurn = gameSession.getPlayerById(turn.playerId)

    Analytics.setGroupPriority(Analytics.EventPriority.Optional)

    # Not tracking anything yet

    Analytics.clearGroupPriority()


  @_sendAnalyticsForCurrentGameSession: (gameSession) ->
    # Check for conditions where we don't want to send game over analytics
    if (not gameSession?)
      gameSession = SDK.GameSession.getInstance()

    if gameSession.getIsSpectateMode()
      return false
    else
      return gameSession.isRanked() or gameSession.isGauntlet() or gameSession.isSinglePlayer() or gameSession.isCasual() or gameSession.isBossBattle() or gameSession.isRift()

# region inventory transaction tracking

module.exports = AnalyticsTracker
