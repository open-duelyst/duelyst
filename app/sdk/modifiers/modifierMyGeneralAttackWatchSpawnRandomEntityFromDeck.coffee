ModifierMyGeneralAttackWatch = require './modifierMyGeneralAttackWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'

class ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck extends ModifierMyGeneralAttackWatch

  type:"ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck"
  @type:"ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck"

  manaCostLimit: 0
  spawnCount: 1
  onlyThisManaCost: false

  @createContextObject: (manaCostLimit, onlyThisManaCost=false, spawnCount=1, options) ->
    contextObject = super(options)
    contextObject.manaCostLimit = manaCostLimit
    contextObject.spawnCount = spawnCount
    contextObject.onlyThisManaCost = onlyThisManaCost
    return contextObject

  onMyGeneralAttackWatch: (action) ->

    deck = @getOwner().getDeck()
    drawPile = deck.getDrawPile()
    indexesOfMinions = []
    for cardIndex, i in drawPile
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getType() == CardType.Unit and ((@onlyThisManaCost and card.getManaCost() == @manaCostLimit) or (!@onlyThisManaCost and card.getManaCost() <= @manaCostLimit))
        indexesOfMinions.push(i)

    if indexesOfMinions.length > 0
      indexOfCardInDeck = indexesOfMinions[@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length)]
      cardIndexToDraw = drawPile[indexOfCardInDeck]
      card = @getGameSession().getCardByIndex(cardIndexToDraw)

      spawnLocation = null
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, card)
      if validSpawnLocations?.length > 0
        spawnLocation = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]

        if spawnLocation?
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnLocation.x, spawnLocation.y, card)
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)


module.exports = ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck