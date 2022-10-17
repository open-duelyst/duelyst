Achievement = require 'app/sdk/achievements/achievement'
CardFactory = require 'app/sdk/cards/cardFactory'
Factions = require 'app/sdk/cards/factionsLookup'
GameSession = require 'app/sdk/gameSession'
RarityLookup = require 'app/sdk/cards/rarityLookup'
CardSet = require 'app/sdk/cards/cardSetLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'
_ = require 'underscore'
i18next = require('i18next')

class SisterAchievement extends Achievement
  @id: "sandSister"
  @title: i18next.t("achievements.sand_sister_title")
  @description: i18next.t("achievements.sand_sister_desc")
  @progressRequired: 1
  @rewards:
    cards: [
      Cards.Faction3.SandSister,
      Cards.Faction3.SandSister,
      Cards.Faction3.SandSister
    ]


  @progressForCardCollection: (cardCollection, allCards) ->

    if not cardCollection?
      return 0

    sisterCount = cardCollection[Cards.Faction3.SandSister]?.count || 0
    if sisterCount >= 3
      return 0

    # check if player owns 3 or more of at least 6 rare cards for this faction
    allFactionRares = _.filter(allCards,(card) ->
      return   card.getFactionId() == Factions.Faction3 and
          card.getRarityId() == RarityLookup.Rare and
          !card.getIsHiddenInCollection() and
          card.getIsAvailable() and
          !Cards.getIsPrismaticCardId(card.getId()) and
          !Cards.getIsSkinnedCardId(card.getId())
    )

    numRaresWith3xCopies = 0
    numCompletedRaresRequired = 6
    for card in allFactionRares
      baseCardId = card.getBaseCardId()
      prismaticCardId = Cards.getPrismaticCardId(baseCardId)
      cardCollectionBase = cardCollection[baseCardId]
      cardCollectionPrismatic = cardCollection[prismaticCardId]
      if (cardCollectionBase?.count || 0) + (cardCollectionPrismatic?.count || 0) >= 3
        numRaresWith3xCopies += 1
        if numRaresWith3xCopies >= 6
          return 1

    return 0

module.exports = SisterAchievement
