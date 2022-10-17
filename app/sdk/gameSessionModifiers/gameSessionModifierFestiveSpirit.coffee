CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
GameSessionModifier = require './gameSessionModifier'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierCollectableCard = require 'app/sdk/modifiers/modifierCollectableCard'

class GameSessionModifierFestiveSpirit extends GameSessionModifier

  type:"GameSessionModifierFestiveSpirit"
  @type:"GameSessionModifierFestiveSpirit"

  @isHiddenToUI: true

  helperMinions: [Cards.Boss.FrostfireSnowchaser, Cards.Boss.FrostfireTiger, Cards.Boss.FrostfireImp]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.player1ChestsAhead = 0
    p.player2ChestsAhead = 0

    return p

  onActivate: () ->
    @spawnFrostfireChest(true)

  spawnFrostfireChest: (isAutomatic) ->
    card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData({id: Cards.Tile.FrostfireChest})
    # not on top of a unit already on the board
    wholeBoardPattern = []
    for boardPos in CONFIG.ALL_BOARD_POSITIONS
      wholeBoardPattern.push(boardPos)
    unitPositions = []
    for unit in @getGameSession().getBoard().getUnits()
      UtilsPosition.removePositionFromPositions(unit.getPosition(), wholeBoardPattern)
    spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, wholeBoardPattern, card, @getCard(), 1)
    if spawnLocations.length > 0
      a = new ApplyCardToBoardAction(@getGameSession(), @getOwnerId(), spawnLocations[0].x, spawnLocations[0].y, card.createNewCardData(), true)
      if isAutomatic
        a.setIsAutomatic(true) # ignore explicit action rules
      @getGameSession().executeAction(a)

  onStartTurn: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      if Math.random() < .33
        @spawnFrostfireChest()

  onAction: (actionEvent) ->
    super(actionEvent)
    if @getGameSession().getIsRunningAsAuthoritative()
      a = actionEvent.action
      # watch for player getting a frostfire chest reward card
      if a instanceof PutCardInHandAction and a.getCard()?.getBaseCardId() is Cards.BossSpell.HolidayGift and a.getTriggeringModifier() instanceof ModifierCollectableCard
        if a.getOwnerId() is @getGameSession().getPlayer1().getPlayerId()
          @_private.player1ChestsAhead++
        else if a.getOwnerId() is @getGameSession().getPlayer2().getPlayerId()
          @_private.player2ChestsAhead++

      if @_private.player1ChestsAhead - @_private.player2ChestsAhead >= 2
        # spawn a helper for player 2
        cardId = @helperMinions[@getGameSession().getRandomIntegerForExecution(@helperMinions.length)]
        card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData({id: cardId})
        player2 = @getGameSession().getPlayer2()
        spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForPlayerId(player2.getPlayerId()).getPosition(), CONFIG.PATTERN_3x3, card, @getCard(), 1)
        if spawnLocations.length > 0
          a = new PlayCardSilentlyAction(@getGameSession(), player2.getPlayerId(), spawnLocations[0].x, spawnLocations[0].y, card.createNewCardData())
          @getGameSession().executeAction(a)
        # reset chests ahead counter
        @_private.player1ChestsAhead = 0
        @_private.player2ChestsAhead = 0

      else if @_private.player2ChestsAhead - @_private.player1ChestsAhead >= 2
        # spawn a helper for player 1
        cardId = @helperMinions[@getGameSession().getRandomIntegerForExecution(@helperMinions.length)]
        card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData({id: cardId})
        player1 = @getGameSession().getPlayer1()
        spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForPlayerId(player1.getPlayerId()).getPosition(), CONFIG.PATTERN_3x3, card, @getCard(), 1)
        if spawnLocations.length > 0
          a = new PlayCardSilentlyAction(@getGameSession(), player1.getPlayerId(), spawnLocations[0].x, spawnLocations[0].y, card.createNewCardData())
          @getGameSession().executeAction(a)
        # reset chests ahead counter
        @_private.player1ChestsAhead = 0
        @_private.player2ChestsAhead = 0

module.exports = GameSessionModifierFestiveSpirit
