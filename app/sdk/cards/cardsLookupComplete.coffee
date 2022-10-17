###
  Cards lookup. Includes base cards lookup as well as prismatics and skins.
  NOTE: in any case where you might need prismatics or card skins, you should require this file instead of cardsLookup.coffee!
###

_ = require "underscore"
CardsLookup = require 'app/sdk/cards/cardsLookup'
CosmeticsLookup = require 'app/sdk/cosmetics/cosmeticsLookup'
CosmeticsFactory = require 'app/sdk/cosmetics/cosmeticsFactory'

CardsLookupComplete = _.extend({}, CardsLookup)
SKIN_IDS_BY_CARD_ID = {}
CARD_IDS_BY_SKIN_ID = {}

CardsLookupComplete.Prismatic = PRISMATIC_OFFSET = 1000000
CardsLookupComplete.Skin = SKIN_OFFSET = PRISMATIC_OFFSET + 1000000

CardsLookupComplete.getBaseCardId = (cardId) ->
  return CardsLookupComplete.getNonSkinnedCardId(cardId) % PRISMATIC_OFFSET

CardsLookupComplete.getSkinnedCardId = (cardId, skinNum) ->
  skinnedCardId = CardsLookupComplete.getBaseCardId(cardId) + Math.max(skinNum, 0) * SKIN_OFFSET
  return if CardsLookupComplete.getIsPrismaticCardId(cardId) then skinnedCardId + PRISMATIC_OFFSET else skinnedCardId

CardsLookupComplete.getCardSkinNum = (cardId) ->
  return Math.floor(cardId / SKIN_OFFSET)

CardsLookupComplete.getIsSkinnedCardId = (cardId) ->
  return cardId > SKIN_OFFSET

CardsLookupComplete.getNonSkinnedCardId = (cardId) ->
  return cardId % SKIN_OFFSET

CardsLookupComplete.getNonPrismaticCardId = (cardId) ->
  nonSkinnedCardId = CardsLookupComplete.getNonSkinnedCardId(cardId)
  return if CardsLookupComplete.getIsPrismaticCardId(nonSkinnedCardId) then cardId - PRISMATIC_OFFSET else cardId

CardsLookupComplete.getIsPrismaticCardId = (cardId) ->
  return CardsLookupComplete.getNonSkinnedCardId(cardId) > PRISMATIC_OFFSET

CardsLookupComplete.getPrismaticCardId = (cardId) ->
  nonSkinnedCardId = CardsLookupComplete.getNonSkinnedCardId(cardId)
  return if CardsLookupComplete.getIsPrismaticCardId(nonSkinnedCardId) then cardId else cardId + PRISMATIC_OFFSET

CardsLookupComplete.getCardSkinIdForCardId = (cardId) ->
  nonPrismaticCardId = CardsLookupComplete.getNonPrismaticCardId(cardId)
  return SKIN_IDS_BY_CARD_ID[nonPrismaticCardId]

CardsLookupComplete.getCardIdForCardSkinId = (cardSkinId) ->
  return CARD_IDS_BY_SKIN_ID[cardSkinId]

# map groups for all cards
GROUP_FOR_CARD_ID = {}
NAME_FOR_CARD_ID = {}
for groupName of CardsLookupComplete
  group = CardsLookupComplete[groupName]
  if _.isObject(group)
    for cardName of group
      cardId = group[cardName]
      GROUP_FOR_CARD_ID[cardId] = group
      NAME_FOR_CARD_ID[cardId] = cardName

# add card skin ids for all card skins
for skinIdKey, skinId of CosmeticsLookup.CardSkin
  cosmeticData = CosmeticsFactory.cosmeticForIdentifier(skinId)
  cardId = cosmeticData.cardId
  cardName = NAME_FOR_CARD_ID[cardId]
  skinNum = cosmeticData.skinNum
  group = GROUP_FOR_CARD_ID[cardId]
  skinnedCardId = CardsLookupComplete.getSkinnedCardId(cardId, skinNum)
  group[cardName + "Skin" + skinNum] = skinnedCardId
  SKIN_IDS_BY_CARD_ID[skinnedCardId] = skinId
  CARD_IDS_BY_SKIN_ID[skinId] = skinnedCardId

# add prismatic ids for all cards
for groupName of CardsLookupComplete
  group = CardsLookupComplete[groupName]
  if _.isObject(group)
    for cardName of group
      cardId = group[cardName]
      prismaticCardId = CardsLookupComplete.getPrismaticCardId(cardId)
      group[cardName + "Prismatic"] = prismaticCardId

module.exports = CardsLookupComplete
