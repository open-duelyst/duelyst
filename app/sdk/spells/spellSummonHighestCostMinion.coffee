SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
KillAction = require 'app/sdk/actions/killAction'
Modifier = require 'app/sdk/modifiers/modifier'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
_ = require 'underscore'

class SpellSummonHighestCostMinion extends SpellSpawnEntity

  appliedName: null
  neutralOnly: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    gameSession = @getGameSession()
    ownerId = @getOwnerId()
    general = @getGameSession().getGeneralForPlayerId(ownerId)
    drawPile = @getOwner().getDeck().getDrawPile()
    possibleCardsToSummon = []

    # first grab indices of all minions in the deck
    for cardIndex in drawPile
      if gameSession.getCardByIndex(cardIndex)?.getType() == CardType.Unit
        if @neutralOnly
          if gameSession.getCardByIndex(cardIndex).factionId == Factions.Neutral
            possibleCardsToSummon.push(cardIndex)
        else
          possibleCardsToSummon.push(cardIndex)

    if possibleCardsToSummon.length > 0
      # then grab the cards those indexes are pointing to
      minionList = []
      for cardIndex in possibleCardsToSummon
        minionList.push(gameSession.getCardByIndex(cardIndex))

      # sort that list of cards by the highest mana cost
      sortedMinionList = _.sortBy(minionList, 'manaCost').reverse()
      highestManaCost = sortedMinionList[0].getManaCost()
      highestManaCostMinions = []

      # once we find the highest mana cost minion, find all other minions that match that mana cost
      for card in sortedMinionList
        if card.getManaCost() == highestManaCost
          highestManaCostMinions.push(card)

      # then choose a random one from the list of those high cost minions
      if highestManaCostMinions.length > 0
        randomIndex = @getGameSession().getRandomIntegerForExecution(highestManaCostMinions.length)
        cardToSummon = highestManaCostMinions[randomIndex]

      # now that we know the card we want to summon, we have to look back in our list of indices to find the index that matches that card
      for cardIndex in possibleCardsToSummon
        if gameSession.getCardByIndex(cardIndex) == cardToSummon
          cardToSummonIndex = cardIndex

      # that new index is what we summon
      if cardToSummonIndex?
        @cardDataOrIndexToSpawn = cardToSummonIndex

    super(board,x,y,sourceAction)

module.exports = SpellSummonHighestCostMinion
