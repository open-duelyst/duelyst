ModifierBackstabWatch = require './modifierBackstabWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
ModifierBackstab = require './modifierBackstab'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CONFIG = require 'app/common/config'

class ModifierBackstabWatchSummonBackstabMinion extends ModifierBackstabWatch

  type:"ModifierBackstabWatchSummonBackstabMinion"
  @type:"ModifierBackstabWatchSummonBackstabMinion"

  cardToAdd: null
  numToAdd: 0

  @createContextObject: (backstabManaCost, options) ->
    contextObject = super(options)
    contextObject.backstabManaCost = backstabManaCost
    return contextObject

  onBackstabWatch: (action) ->

    for i in [0...@numToAdd]
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), @cardToAdd)
      @getGameSession().executeAction(putCardInHandAction)

    deck = @getOwner().getDeck()
    drawPile = deck.getDrawPile()
    indexesOfMinions = []
    for cardIndex, i in drawPile
      # find only frost minions
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getType() == CardType.Unit and card.getManaCost() <= @backstabManaCost and card.hasModifierClass(ModifierBackstab)
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

module.exports = ModifierBackstabWatchSummonBackstabMinion
