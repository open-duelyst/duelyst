express = require 'express'
_ = require 'underscore'
knex = require '../../../lib/data_access/knex'
DecksModule = require '../../../lib/data_access/decks'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'
validators = require '../../../validators'

router = express.Router()

router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  DecksModule.decksForUser(user_id)
  .then (decks) ->
    # for each deck
    # map integer arrays to card objects for deck builder
    for deckData in decks
      deckData.cards = _.map deckData.cards, (cardId) -> return { id: cardId }
    res.status(200).json(DataAccessHelpers.restifyData(decks))
  .catch (error) -> next(error)

router.get '/:deck_id', (req, res, next) ->
  result = t.validate(req.params.deck_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  deck_id = result.value

  knex("user_decks").where({'user_id':user_id,'id':deck_id}).first()
  .then (deckData)->
    # map integer arrays to card objects for deck builder
    deckData.cards = _.map deckData.cards, (cardId)-> return { id: cardId }
    res.status(200).json(deckData)
  .catch (error) -> next(error)

router.post "/", (req, res, next) ->
  deck_input = t.validate(req.body, validators.deckInput)
  if not deck_input.isValid()
    return res.status(400).json(deck_input.errors)

  user_id = req.user.d.id
  faction_id = deck_input.value.faction_id
  name = deck_input.value.name
  cards = deck_input.value.cards
  spell_count = deck_input.value.spell_count
  minion_count = deck_input.value.minion_count
  artifact_count = deck_input.value.artifact_count
  color_code = deck_input.value.color_code
  card_back_id = deck_input.value.card_back_id

  # map card objects to integer arrays for the database
  cards = _.map cards, (cardData)-> return cardData.id

  DecksModule.addDeck(user_id,faction_id,name,cards,spell_count,minion_count,artifact_count,color_code,card_back_id)
  .then (deckData)->
    # map integer arrays to card objects for deck builder
    deckData.cards = _.map deckData.cards, (cardId)-> return { id: cardId }
    res.status(200).json(DataAccessHelpers.restifyData(deckData))
  .catch (error) -> next(error)

router.put "/:deck_id", (req, res, next) ->
  deck_id = t.validate(req.params.deck_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not deck_id.isValid()
    return next()
  deck_input = t.validate(req.body, validators.deckInput)
  if not deck_input.isValid()
    return res.status(400).json(deck_input.errors)

  user_id = req.user.d.id
  deck_id = deck_id.value
  faction_id = deck_input.value.faction_id
  name = deck_input.value.name
  cards = deck_input.value.cards
  spell_count = deck_input.value.spell_count
  minion_count = deck_input.value.minion_count
  artifact_count = deck_input.value.artifact_count
  color_code = deck_input.value.color_code
  card_back_id = deck_input.value.card_back_id

  # map card objects to integer arrays for the database
  cards = _.map cards, (cardData) -> return cardData.id

  DecksModule.updateDeck(user_id,deck_id,faction_id,name,cards,spell_count,minion_count,artifact_count,color_code,card_back_id)
  .then (deckData)->
    # map integer arrays to card objects for deck builder
    deckData.cards = _.map deckData.cards, (cardId)-> return { id: cardId }
    res.status(200).json(DataAccessHelpers.restifyData(deckData))
  .catch (error) -> next(error)

router.delete "/:deck_id", (req, res, next) ->
  result = t.validate(req.params.deck_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  deck_id = result.value

  knex("user_decks").where({'user_id':user_id,'id':deck_id}).delete()
  .then (deckData)-> res.status(200).json({})
  .catch (error) -> next(error)

module.exports = router
