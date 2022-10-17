CONFIG = require 'app/common/config'
SpellSpawnEntity = require './spellSpawnEntity'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Rarity = require 'app/sdk/cards/rarityLookup'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellFollowupSpawnEntityFromDeck extends SpellSpawnEntity

  canBeAppliedAnywhere: false
  spawnSilently: true
  cardDataOrIndexToSpawn: null
  hasSearchedForCardOnSendingSide = false # search for card in deck once when sending request to play followup

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cardToFind = {id: Cards.Faction1.Friendsguard} # we're looking for a friendsguard
    p.hasSearchedForCard = false # only search for the card in deck once locally

    return p

  getCardDataOrIndexToSpawn: () ->
    # if we haven't yet checked if the target card is in the deck
    if (@getGameSession().getIsRunningAsAuthoritative() and !@_private.hasSearchedForCard) || !@hasSearchedForCardOnSendingSide
      # find the card in the deck
      drawPile = @getOwner().getDeck().getDrawPile()
      indexesOfDraw = []
      for cardIndex, i in drawPile
        cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
        if cardAtIndex.getBaseCardId() == @_private.cardToFind.id
          indexesOfDraw.push(i)

      if indexesOfDraw.length > 0
        minionIndexToPlay = @getGameSession().getRandomIntegerForExecution(indexesOfDraw.length)
        indexOfCardInDeck = indexesOfDraw[minionIndexToPlay]
        @cardDataOrIndexToSpawn = drawPile[indexOfCardInDeck]
      @hasSearchedForCardOnSendingSide = true # we won't check if the card is in deck again on sending side
      @_private.hasSearchedForCard = true
    return super()


  _postFilterPlayPositions: (validPositions) ->
    @getCardDataOrIndexToSpawn()
    if !@cardDataOrIndexToSpawn
      return super([])
    else
      return super(validPositions)

module.exports = SpellFollowupSpawnEntityFromDeck
