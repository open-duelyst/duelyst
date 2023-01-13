_ = require 'underscore'
Promise = require 'bluebird'

CONFIG = require '../../app/common/config'
Logger = require '../../app/common/logger.coffee'
SDK = require '../../app/sdk.coffee'
InventoryModule = require './data_access/inventory.coffee'
knex = require './data_access/knex.coffee'

# Helper function to grant a full card collection to users.
# This code is nearly identical to the /api/me/qa/inventory/fill_collection handler.
grantFullCollection = (userId) ->
  # Inspect the user's collection to avoid granting copies beyond the max.
  txPromise = knex.transaction (tx) ->
    return tx('user_card_collection').where('user_id', userId).first()
    .then (cardCollectionRow) ->
      missingCardIds = []

      # Iterate each available card ID from the SDK.
      _.each(SDK.GameSession.getCardCaches()
              .getIsCollectible(true)
              .getIsPrismatic(false)
              .getIsSkinned(false)
              .getCardIds(), (cardId) ->
        if cardCollectionRow? and cardCollectionRow.cards?
          cardData = cardCollectionRow.cards[cardId]
          numMissing = 0

          # Mythron-rarity cards are limited to 1 copy.
          if (SDK.CardFactory.cardForIdentifier(cardId).getRarityId() == SDK.Rarity.Mythron)
            if cardData?
              numMissing = Math.max(0, 1 - cardData.count)
            else
              numMissing = 1

          # Other cards use the typical maximum.
          else
            if cardData?
              numMissing = Math.max(0, CONFIG.MAX_DECK_DUPLICATES - cardData.count)
            else
              numMissing = CONFIG.MAX_DECK_DUPLICATES

        # If there is no user collection, grant the max number of copies.
        else
          if (SDK.CardFactory.cardForIdentifier(cardId).getRarityId() == SDK.Rarity.Mythron)
            numMissing = 1
          else
            numMissing = CONFIG.MAX_DECK_DUPLICATES

        # If the user was missing copies of this card, add them to the list.
        if numMissing > 0
          for i in [0..numMissing]
            missingCardIds.push(cardId)
      )

      # If the user was missing cards, add them to the collection.
      if missingCardIds.length > 0
        return InventoryModule.giveUserCards(txPromise, tx, userId, missingCardIds, 'FullCollection', 'FullCollection', 'Full Collection')
      else
        return Promise.resolve()

  return txPromise.then () ->
    Logger.module('INVENTORY') "Granted full collection to user #{userId}"

module.exports = grantFullCollection
