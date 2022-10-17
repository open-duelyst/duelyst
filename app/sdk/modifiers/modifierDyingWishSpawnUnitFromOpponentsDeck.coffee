CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierDyingWish = require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierDyingWishSpawnUnitFromOpponentsDeck extends ModifierDyingWish

  type:"ModifierDyingWishSpawnUnitFromOpponentsDeck"
  @type:"ModifierDyingWishSpawnUnitFromOpponentsDeck"

  @description: "Summon %X"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (spawnDescription = "random minion", spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if UtilsPosition.getArraysOfPositionsAreEqual(modifierContextObject.spawnPattern, CONFIG.PATTERN_1x1)
        replaceText = "a "+modifierContextObject.spawnDescription+" from the opponent\'s deck on this space"
      else if modifierContextObject.spawnCount == 1
        replaceText = "a "+modifierContextObject.spawnDescription+" from the opponent\'s deck in a random nearby space"
      else if modifierContextObject.spawnCount == 8
        replaceText = ""+modifierContextObject.spawnDescription+"s from the opponent\'s deck in all nearby spaces"
      else
        replaceText = ""+modifierContextObject.spawnDescription+"s from the opponent\'s deck into "+modifierContextObject.spawnCount+" nearby spaces"
      return @description.replace /%X/, replaceText
    else
      return @description

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.canConvertCardToPrismatic = false # stealing an actual card, so don't convert to prismatic based on this card

    return p

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      opponentsDeck = @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()).getDeck()
      indexesOfMinions = []
      gameSession = @getGameSession()
      drawPile = opponentsDeck.getDrawPile()
      for cardIndex, i in drawPile
        card = gameSession.getCardByIndex(cardIndex)
        if card? and card.getType() == CardType.Unit
          indexesOfMinions.push(i)

      if UtilsPosition.getArraysOfPositionsAreEqual(@contextObject?.spawnPattern, CONFIG.PATTERN_1x1)
        spawnCount = 1
      else
        spawnCount = @spawnCount

      numSpawned = 0
      while indexesOfMinions.length > 0 and numSpawned < spawnCount
        numSpawned++
        indexOfCardInDeck = indexesOfMinions.splice(@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length), 1)[0]
        cardIndex = drawPile[indexOfCardInDeck]
        card = @getGameSession().getCardByIndex(cardIndex)
        spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), action.getTargetPosition(), @spawnPattern, card, @getCard(), 1)

        for position in spawnLocations
          if !@spawnSilently
            playCardAction = new PlayCardAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardIndex)
          else
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardIndex)
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)

module.exports = ModifierDyingWishSpawnUnitFromOpponentsDeck
