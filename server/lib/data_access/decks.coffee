Promise = require 'bluebird'
_ = require 'underscore'
util = require 'util'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
knex = require("../data_access/knex")
InventoryModule = require("./inventory")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
crypto = require('crypto')

# SDK imports
SDK = require '../../../app/sdk'
FactionFactory = require '../../../app/sdk/cards/factionFactory.coffee'
CardFactory = require '../../../app/sdk/cards/cardFactory.coffee'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
en = require '../../../app/localization/locales/en/index.json'

class DecksModule
  ###*
  # Retrieve all user decks
  # @public
  # @param  {String}    userId      User ID.
  # @return  {Promise}
  ###
  @decksForUser: (userId)->
    return knex("user_decks").where('user_id',userId).select()

  ###*
  # Add a new deck for a user
  # @public
  # @param  {String}    userId      User ID.
  # @param  {String}    deckId      Deck ID.
  # @param  {String}    name      Name for deck.
  # @param  {Array}      cards      Array of Card IDs to update deck with
  # @param  {Number}      spellCount      number of spells
  # @param  {Number}      minionCount      number of minions
  # @param  {Number}      artifactCount    number of artifacts
  # @param  {Number}      colorCode    color code
  # @param  {Number}      cardBackId    card back id
  # @return  {Promise}
  ###
  @addDeck: (userId,factionId,name,cards,spellCount,minionCount,artifactCount,colorCode,cardBackId)->

    MOMENT_NOW_UTC = moment().utc()

    newDeckData = {
      id:generatePushId()
      user_id:userId
      name:name
      faction_id:factionId
      cards:cards
      spell_count:spellCount
      minion_count:minionCount
      artifact_count:artifactCount
      color_code:colorCode
      card_back_id:cardBackId
      created_at:MOMENT_NOW_UTC.toDate()
    }

    if cardBackId?
      isAllowedToUseCardBackPromise = InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, cardBackId)
    else
      isAllowedToUseCardBackPromise = Promise.resolve()

    return isAllowedToUseCardBackPromise
    .bind {}
    .then ()->
      return knex("user_decks").insert(newDeckData)
    .then ()->
      return newDeckData

  ###*
  # Update a user's deck
  # @public
  # @param  {String}    userId      User ID.
  # @param  {String}    deckId      Deck ID.
  # @param  {String}    name      Name for deck.
  # @param  {Array}      cards      Array of Card IDs to update deck with
  # @param  {Number}      spellCount      number of spells
  # @param  {Number}      minionCount      number of minions
  # @param  {Number}      artifactCount    number of artifacts
  # @param  {Number}      colorCode    color code
  # @param  {Number}      cardBackId    card back id
  # @return  {Promise}
  ###
  @updateDeck: (userId,deckId,factionId,name,cards,spellCount,minionCount,artifactCount,colorCode,cardBackId)->

    MOMENT_NOW_UTC = moment().utc()

    newDeckData = {
      name:name
      faction_id:factionId
      cards:cards
      spell_count:spellCount
      minion_count:minionCount
      artifact_count:artifactCount
      color_code:colorCode
      card_back_id:cardBackId
      updated_at:MOMENT_NOW_UTC.toDate()
    }

    if cardBackId?
      isAllowedToUseCardBackPromise = InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, cardBackId)
    else
      isAllowedToUseCardBackPromise = Promise.resolve()

    return isAllowedToUseCardBackPromise
    .bind {}
    .then ()->
      return knex("user_decks").where({'user_id':userId,'id':deckId}).update(newDeckData)
    .then ()->
      return newDeckData

  ###*
  # Generate a short digest for a list of card IDs.
  # Method is to generate a string message M and grab first 16 bits of AES-CTR(SHA256(M)) and output as hex.
  # @public
  # @param  {Array}      cards      Array of Integer Card IDs to update deck with
  # @param  {String}    salt      User based salt
  # @return  {String}
  ###
  @hashForDeck: (cards, salt)->
    if !cards
      return null

    baseCardIds = _.map(cards,(card) -> return SDK.Cards.getBaseCardId(card))
    sortedCardIds = baseCardIds.sort()
    Logger.module("DecksModule").debug "hashCodeForDeck() -> generating hash for #{sortedCardIds}"

    hash = crypto.createHash('sha256')
    val = sortedCardIds.join(',') + salt
    hash.update(val)
    digest = hash.digest('hex')
    Logger.module("DecksModule").debug "hashCodeForDeck() -> digest: #{digest}"

    # FIXME: (node:27) Warning: Use Cipheriv for counter mode of aes-256-ctr
    cipher = crypto.createCipher('aes-256-ctr','dcDnVgALT39spZb')
    crypted = cipher.update(digest,'utf8','hex')
    crypted += cipher.final('hex')
    Logger.module("DecksModule").debug "hashCodeForDeck() -> crypted: #{crypted}"

    final = crypted.slice(0,18)
    Logger.module("DecksModule").debug "hashCodeForDeck() -> final: #{final}"

    return final

  # Retrieve a user's decks, and return them as a JSON-encoded string.
  @getDecksAsJSON: (userId) ->
    result = {}
    @decksForUser(userId)
    .then (decks) ->
      for deckData in decks
        # Collect card names.
        cardNames = []
        for card in deckData.cards
          cardNames.push(en['cards'][CardFactory.cardForIdentifier(card, null).name.substring(6)])
        # Encode the results.
        result[deckData.id] =
          name: deckData.name
          faction_id: deckData.faction_id
          faction_name: FactionFactory.factionForIdentifier(deckData.faction_id).devName
          cards: deckData.cards
          card_names: cardNames
          spell_count: deckData.spell_count
          minion_count: deckData.minion_count
          artifact_count: deckData.artifact_count
      Logger.module("DecksModule").debug "encoded decks for user #{userId}"
      return result
    .catch (error) ->
      Logger.module("DecksModule").error "failed to encode decks: #{error}"
      throw error

  # Given a JSON object from @getDecksAsJSON, create corresponding decks for the user.
  @putDecksFromJSON: (userId, obj) ->
    for key in Object.keys(obj)
      deck = obj[key]
      @addDeck(
        userId,
        deck.faction_id,
        deck.name,
        deck.cards,
        deck.spell_count,
        deck.minion_count,
        deck.artifact_count,
        0,
        null
      ).then (deck) ->
        Logger.module("DecksModule").debug "created deck #{deck.id} for user #{userId}"
      .catch (error) ->
        Logger.module("DecksModule").error "failed to create deck: #{error}"
        throw error

module.exports = DecksModule
