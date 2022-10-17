Achievement = require 'app/sdk/achievements/achievement'
Factions = require 'app/sdk/cards/factionsLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Rarity = require 'app/sdk/cards/rarityLookup'
CardSet = require 'app/sdk/cards/cardSetLookup'
_ = require 'underscore'
i18next = require('i18next')

class CollectorSupremeAchievement extends Achievement
  @id: "collectorSupreme"
  @title: i18next.t("achievements.collector_supreme_title")
  @description: i18next.t("achievements.collector_supreme_desc")
  @progressRequired: 1
  @rewards:
    neutralEpicCard: 1
    neutralRareCard: 1

  @progressForCardCollection: (cardCollection, allCards) ->

    if not cardCollection?
      return 0

    # check if player owns one of every common card
    allCommonCards = _.filter(allCards,(card) ->
      return card.getRarityId() == Rarity.Common and
        card.getCardSetId() == CardSet.Core and
        !card.getIsHiddenInCollection() and
        card.getIsAvailable() and
        card.factionId != Factions.Tutorial and
        !Cards.getIsPrismaticCardId(card.getId())
    )

    for card in allCommonCards
      baseCardId = card.getBaseCardId()
      prismaticCardId = Cards.getPrismaticCardId(baseCardId)
      cardCollectionBase = cardCollection[baseCardId]
      cardCollectionPrismatic = cardCollection[prismaticCardId]
      if (cardCollectionBase?.count || 0) + (cardCollectionPrismatic?.count || 0) == 0
        return 0

    return 1

module.exports = CollectorSupremeAchievement
