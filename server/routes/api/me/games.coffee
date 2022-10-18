express = require 'express'
request = require 'superagent'
moment = require 'moment'
Promise = require 'bluebird'
_ = require 'underscore'
{GameManager} = require '../../../redis/'
{WatchableGamesManager} = require '../../../redis/'

# sdk
GameSetup = require '../../../../app/sdk/gameSetup'
GameType = require '../../../../app/sdk/gameType'
GameStatus = require '../../../../app/sdk/gameStatus'
GameSession = require '../../../../app/sdk/gameSession'
FactionProgression = require '../../../../app/sdk/progression/factionProgression'
GamesModule = require '../../../lib/data_access/games'
UsersModule = require '../../../lib/data_access/users'
InventoryModule = require '../../../lib/data_access/inventory'
DecksModule = require '../../../lib/data_access/decks'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger'
Errors = require '../../../lib/custom_errors'
generatePushId = require '../../../../app/common/generate_push_id'
Consul = require '../../../lib/consul'
config = require '../../../../config/config'
CONFIG = require('../../../../app/common/config')
{version} = require '../../../../version'
t = require 'tcomb-validation'
validators = require '../../../validators'
createSinglePlayerGame = require '../../../lib/create_single_player_game'
validatorTypes = require '../../../validators/types'
UtilsGameSession = require '../../../../app/common/utils/utils_game_session.coffee'

RankDivisionLookup = require('../../../../app/sdk/rank/rankDivisionLookup')
RankFactory = require('../../../../app/sdk/rank/rankFactory')
CardType = require('../../../../app/sdk/cards/cardType')
Rarity = require('../../../../app/sdk/cards/rarityLookup')
Cards = require '../../../../app/sdk/cards/cardsLookupComplete'
GameSetups = require '../../../ai/decks/game_setups'
CosmeticsFactory = require '../../../../app/sdk/cosmetics/cosmeticsFactory'

awsRegion = config.get('aws.region')
awsReplaysBucket = config.get('aws.replaysBucketName')

router = express.Router()

router.get "/", (req, res, next) ->
  user_id = req.user.d.id
  page = req.query.page

  page ?= 0

  Logger.module("API").debug "loading games for page: #{page}"

  knex("user_games").where('user_id',user_id).orderBy('game_id','desc').offset(page*10).limit(10).select()
  .then (rows) ->
    playerFacingRows = _.map(rows, (row) ->
      row = _.omit(row, ["rating","rating_delta","is_bot_game"])
      #row["digest"] = DecksModule.hashForDeck(row["deck_cards"], user_id)
      return row
    )
    res.status(200).json(DataAccessHelpers.restifyData(playerFacingRows))
  .catch (error) -> next(error)

router.get "/watchable/:division_name", (req, res, next) ->

  division_name = t.validate(req.params.division_name, validatorTypes.DivisionName)
  if not division_name.isValid()
    return res.status(400).json(division_name.errors)
  division_name = req.params.division_name
  division_name = division_name.charAt(0).toUpperCase() + division_name.slice(1)

  divisionRankMaxValue = RankDivisionLookup[division_name]
  divisionRankMinValue = -1

  for i in [divisionRankMaxValue..0]
    if RankFactory.rankedDivisionKeyForRank(i) != division_name
      divisionRankMinValue = i
      break

  WatchableGamesManager.loadGamesDataForDivision(division_name)
  .then (data)->
    if data
      Logger.module("API").debug "loaded watchable games data from REDIS"
      return res.status(200).json(data)
    else

      gameVersion = version.slice(0,version.lastIndexOf('.'))
      gameVersion += '%'

      # if (config.get('env') == "local")
      #   gameVersion = '%%'

      requiredGameCount = config.get('watchSectionMinCurrentVersionGameCount') || 1000

      Logger.module("API").debug "GENERATING watchable games data from rank #{divisionRankMaxValue} to #{divisionRankMinValue}"
      # first write an empty array into redis while the query is running so other servers don't step on the process toes
      return WatchableGamesManager.saveGamesDataForDivision(division_name,JSON.stringify([]))
      .bind {}
      .then ()->
        return knex.raw("""
          select count(id) as game_count
          from (select * from games order by created_at DESC LIMIT ?) as games
          where version LIKE ?
        """,[requiredGameCount,gameVersion])
      .then (result)->
        gameCount = result?.rows?[0]?["game_count"] || 0
        Logger.module("API").debug "Found #{gameCount} potential watchable games within version #{version}. Need #{requiredGameCount}"
        if gameCount < requiredGameCount
          @.gamesData = []
          return Promise.resolve(null)
        else
          # NOTE: this is a very expensive query
          return knex.raw("""
            select
              games.*,
              player_1.portrait_id AS player_1_portrait_id,
              player_1.username AS player_1_username,
              player_2.portrait_id AS player_2_portrait_id,
              player_2.username AS player_2_username
            from
              (
                select *
                from (
                  select * from games
                  order by created_at DESC LIMIT 10000
                ) as inner_games
                where
                  is_conceded = false AND
                  is_bot_game = false AND
                  type = 'ranked' AND
                  duration < 700 AND
                  abs(player_1_health - player_2_health) < 10 AND
                  player_1_rank > ? AND
                  player_1_rank <= ? AND
                  player_2_rank > ? AND
                  player_2_rank <= ? AND
                  version LIKE ?
                LIMIT 10
              ) as games

            JOIN users AS player_1 ON player_1.id = games.player_1_id
            JOIN users AS player_2 ON player_2.id = games.player_2_id;
          """,
            [divisionRankMinValue, divisionRankMaxValue, divisionRankMinValue, divisionRankMaxValue, gameVersion]
          )
      .then (result)->
        if result?
          rows = result.rows

          # TODO: This seems broken, validate and handle here: https://trello.com/c/yiWKXGlI/2187
          allCollectibleUnitsCache = GameSession.getCardCaches().getType(CardType.Unit).getIsCollectible(true).getIsHiddenInCollection(false).getIsPrismatic(false)
          allCollectibleUnits = allCollectibleUnitsCache.getCards()
          allCollectibleUnitsIds = allCollectibleUnitsCache.getCardIds()

          @.gamesData = _.map rows, (row)->

            row.player_1_deck = _.intersection(allCollectibleUnitsIds,_.uniq(row.player_1_deck))
            row.player_2_deck = _.intersection(allCollectibleUnitsIds,_.uniq(row.player_2_deck))
            row.player_1_deck = _.sortBy row.player_1_deck, (cId)-> return _.find(allCollectibleUnits,(u)-> u.id == cId).rarityId
            row.player_2_deck = _.sortBy row.player_2_deck, (cId)-> return _.find(allCollectibleUnits,(u)-> u.id == cId).rarityId

            return {
              id: row.id
              division: division_name.toLowerCase()
              created_at: moment.utc(row.created_at).valueOf()
              winner_id: row.winner_id
              # p1
              player_1_id: row.player_1_id
              player_1_username: row.player_1_username
              player_1_faction_id: row.player_1_faction_id
              player_1_general_id: row.player_1_general_id
              player_1_portrait_id: row.player_1_portrait_id
              player_1_key_cards: row.player_1_deck.slice(1,5)
              # p2
              player_2_id: row.player_2_id
              player_2_username: row.player_2_username
              player_2_faction_id: row.player_2_faction_id
              player_2_general_id: row.player_2_general_id
              player_2_portrait_id: row.player_2_portrait_id
              player_2_key_cards: row.player_2_deck.slice(1,5)
            }

          return Promise.map @.gamesData, (gameRow)->
            gameDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/#{gameRow.id}.json"
            Logger.module("API").debug "downloading game #{gameRow.id} replay data from #{gameDataUrl}"
            return new Promise((resolve,reject)->
              request.get(gameDataUrl).end (err, res) ->
                if res? && res.status >= 400
                  # Network failure, we should probably return a more intuitive error object
                  Logger.module("API").error "ERROR! Failed to connect to games data: #{res.status} ".red
                  return reject(new Error("Failed to connect to games data."))
                else if err
                  # Internal failure
                  Logger.module("API").error "ERROR! _retrieveGameSessionData() failed: #{err.message} ".red
                  return reject(err)
                else
                  return resolve(res.text)
            ).then (gameSessionDataString)->
              # scrub the data here
              Logger.module("API").debug "deserializing game #{gameRow.id} replay data"
              gameSession = GameSession.create()
              gameSession.deserializeSessionFromFirebase(JSON.parse(gameSessionDataString))
              gameRow.player_1_key_cards = []
              gameRow.player_2_key_cards = []
              for turn in gameSession.turns
                for step in turn.steps
                  if step.action.type == "PlayCardFromHandAction" and step.action.getCard().getType() == CardType.Unit
                    playerId = step.getPlayerId()
                    cardId = step.action.getCard().getId()
                    Logger.module("API").debug "adding key card #{cardId} for game #{gameRow.id} player #{playerId}"
                    #
                    if gameRow.player_1_id == playerId and gameRow.player_1_key_cards.length < 4
                      gameRow.player_1_key_cards.push(cardId)
                    #
                    if gameRow.player_2_id == playerId and gameRow.player_2_key_cards.length < 4
                      gameRow.player_2_key_cards.push(cardId)
      .then ()->
        return WatchableGamesManager.saveGamesDataForDivision(division_name,JSON.stringify(@.gamesData))
      .then ()->
        return res.status(200).json(@.gamesData)
  .catch (error) -> next(error)

router.get "/watchable/:division_name/:game_id/replay_data", (req, res, next) ->

  Logger.module("API").debug "watchable/:division_name/:game_id/replay_data"

  division_name = t.validate(req.params.division_name, validatorTypes.DivisionName)
  if not division_name.isValid()
    return res.status(400).json(division_name.errors)

  result = t.validate(req.params.game_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return res.status(400).json(result.errors)

  # user id is set by a middleware
  user_id = req.user_id
  game_id = result.value
  player_id = req.query.playerId

  division_name = req.params.division_name
  division_name = division_name.charAt(0).toUpperCase() + division_name.slice(1)

  Logger.module("API").debug "loading watchable game metadata for division from REDIS"

  WatchableGamesManager.loadGamesDataForDivision(division_name)
  .then (data)->
    Logger.module("API").debug "checking that #{game_id} is in list of promoted games"
    if not (_.find data, (g)-> g.id == game_id)
      throw new Errors.NotFoundError()
    return knex("games").where('id',game_id).first()
  .then (row) ->
    if row?
      gameDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/#{game_id}.json"
      mouseUIDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/ui_events/#{game_id}.json"
      Logger.module("API").debug "starting download of game #{game_id} replay data from #{gameDataUrl}"
      downloadGameSessionDataAsync = new Promise (resolve,reject)->
        request.get(gameDataUrl).end (err, res) ->
          if res? && res.status >= 400
            # Network failure, we should probably return a more intuitive error object
            Logger.module("API").error "ERROR! Failed to connect to games data: #{res.status} ".red
            return reject(new Error("Failed to connect to games data."))
          else if err
            # Internal failure
            Logger.module("API").error "ERROR! _retrieveGameSessionData() failed: #{err.message} ".red
            return reject(err)
          else
            return resolve(res.text)
      downloadMouseUIDataAsync = new Promise (resolve,reject)->
        request.get(mouseUIDataUrl).end (err, res) ->
          if res? && res.status >= 400
            # Network failure, we should probably return a more intuitive error object
            Logger.module("API").error "ERROR! Failed to connect to ui event data: #{res.status} ".red
            return reject(new Error("Failed to connect to ui event data."))
          else if err
            # Internal failure
            Logger.module("API").error "ERROR! _retrieveGameUIEventData() failed: #{err.message} ".red
            return reject(err)
          else
            return resolve(res.text)
      return Promise.all([
        downloadGameSessionDataAsync,
        downloadMouseUIDataAsync
      ])
    else
      return [null,null]
  .spread (gameDataString,mouseUIDataString)->
    Logger.module("API").debug "downloaded game #{game_id} replay data. size:#{gameDataString?.length || 0}"
    if not gameDataString? or not mouseUIDataString?
      res.status(404).json({})
    else
      gameSessionData = JSON.parse(gameDataString)
      mouseUIData = JSON.parse(mouseUIDataString)

      # initialize game session for scrubbing
      gameSession = GameSession.create()
      gameSession.deserializeSessionFromFirebase(JSON.parse(gameDataString))

      # player perspective
      fromPerspectiveOfPlayerId = player_id || gameSession.getWinnerId()

      # scrub data
      gameSessionData = UtilsGameSession.scrubGameSessionData(gameSession,gameSessionData,fromPerspectiveOfPlayerId,true)

      res.status(200).json({ gameSessionData: gameSessionData, mouseUIData:mouseUIData })
  .catch (error) -> next(error)

router.put "/:game_id/gold_tip_amount", (req, res, next) ->
  game_id = t.validate(req.params.game_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not game_id.isValid()
    return next()
  amount = t.validate(req.body.amount, t.subtype(t.Number, (n) -> n == 5))
  if not amount.isValid()
    return res.status(400).json(amount.errors)

  user_id = req.user.d.id
  game_id = game_id.value
  amount = amount.value

  UsersModule.tipAnotherPlayerForGame(user_id,game_id,amount)
  .then ()-> res.status(200).json({})
  .catch Errors.AlreadyExistsError, (e)-> res.status(304).json({})
  .catch (error) -> next(error)

router.post "/single_player", (req, res, next) ->
  result = t.validate(req.body, validators.singlePlayerInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  userId = req.user.d.id
  deck = result.value.deck
  aiGeneralId = result.value.ai_general_id
  cardBackId = result.value.cardBackId
  battleMapId = result.value.battleMapId
  hasPremiumBattleMaps = result.value.hasPremiumBattleMaps || false
  battleMapIndexesToSampleFrom = null # will be configured later based on inputs
  ai_username = result.value.ai_username


  if hasPremiumBattleMaps and not battleMapId?
    Logger.module("SINGLE PLAYER").debug "#{userId} wants RANDOM battlemap"
  else if battleMapId?
    Logger.module("SINGLE PLAYER").debug "#{userId} wants battlemap #{battleMapId}"

  # re-map deck for correct formatting and anti-cheat
  deck = _.map(deck, (card)->
    if _.isString(card) or _.isNumber(card)
      return { id: card }
    else if card.id?
      return { id: card.id }
  )

  # get user faction
  generalId = deck[0].id
  generalCard = GameSession.getCardCaches().getCardById(generalId)
  userFactionId = generalCard.getFactionId()

  # validate deck
  return Promise.all([
    # if no selected battlemap, but user wants a random battlemap from their set, grab the battlemaps they own and add them to the list
    (if hasPremiumBattleMaps and not battleMapId? then knex("user_cosmetic_inventory").select("cosmetic_id").where("cosmetic_id", ">", 50000).andWhere("cosmetic_id", "<", 60000).andWhere("user_id", userId) else Promise.resolve())
    # check whether user is allowed to use this deck
    UsersModule.isAllowedToUseDeck(userId, deck, GameType.SinglePlayer,null),
    # check whether user is allowed to use this card back
    (if cardBackId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, cardBackId) else Promise.resolve()),
    (if battleMapId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, battleMapId) else Promise.resolve())
  ])
  .bind {}
  .spread (ownedBattleMapCosmeticRows)->

    if battleMapId?
      Logger.module("SINGLE PLAYER").debug "#{userId} selected battlemap: #{battleMapId}"
      battleMapIndexesToSampleFrom ?= [CosmeticsFactory.cosmeticForIdentifier(battleMapId).battleMapTemplateIndex]
    else if ownedBattleMapCosmeticRows?.length > 0
      Logger.module("SINGLE PLAYER").debug "#{userId} owns following battlemaps: #{ownedBattleMapCosmeticRows}"
      ownedIndexes = _.map ownedBattleMapCosmeticRows,(r)-> return CosmeticsFactory.cosmeticForIdentifier(r.cosmetic_id).battleMapTemplateIndex
      battleMapIndexesToSampleFrom ?= _.union(CONFIG.BATTLEMAP_DEFAULT_INDICES,ownedIndexes)

    return knex("user_faction_progression").where({"user_id": userId, "faction_id": userFactionId}).first("win_count")
  .then (progressionRow)->
    # setup ai username from general name
    aiPlayerId = CONFIG.AI_PLAYER_ID
    aiGeneralCard = GameSession.getCardCaches().getCardById(aiGeneralId)
    aiUsername = ai_username || (aiGeneralCard?.getName()) || "Opponent"

    # allow customization of single player games when ai tools are enabled
    if config.get("aiToolsEnabled")
      aiDifficulty = result.value.ai_difficulty
      aiNumRandomCards = result.value.ai_num_random_cards
      Logger.module("SINGLE PLAYER").debug "Custom request #{userId} : AI difficulty: #{aiDifficulty} : num random cards: #{aiNumRandomCards}"

    if !aiDifficulty?
      # ai difficulty ramps up from 0% to max based on faction win count
      win_count = progressionRow?.win_count || 0
      aiDifficulty = Math.min(1.0, win_count / 10)
      Logger.module("SINGLE PLAYER").debug "Request #{userId} : AI difficulty: #{aiDifficulty} : Win count: #{win_count}"

    if !aiNumRandomCards?
      # ai in single player should never use random cards
      aiNumRandomCards = 0

    # custom game setup options
    gameSetupOptions = {
      ai: {
        # set ai starting hand size based on difficulty
        startingHandSize: Math.min(CONFIG.STARTING_HAND_SIZE, Math.max(1, Math.floor(CONFIG.STARTING_HAND_SIZE * Math.min(1.0, aiDifficulty / 0.2))))
      }
    }

    # create game
    return createSinglePlayerGame(userId,"You",GameType.SinglePlayer,deck,cardBackId,battleMapIndexesToSampleFrom,aiPlayerId,aiUsername,aiGeneralId,null,aiDifficulty,aiNumRandomCards,null,gameSetupOptions)
  .then (responseData)-> # send data back to the player
    res.status(200).json(responseData)
  .catch Errors.InvalidDeckError, (error) ->
    Logger.module("SINGLE PLAYER").debug "Request #{userId} : attempting to use invalid deck!".red
    return res.status(400).json({ error: error.message })
  .catch Errors.SinglePlayerModeDisabledError, (error)->
    Logger.module("SINGLE PLAYER").debug "Request #{userId} : attempting to use invalid deck!".red
    return res.status(400).json({ error: error.message })
  .catch (error) ->
    Logger.module("SINGLE PLAYER").error "ERROR: Request.post /single_player #{userId} failed!".red
    return next(error)

router.post "/boss_battle", (req, res, next) ->
  result = t.validate(req.body, validators.bossBattleInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  userId = req.user.d.id
  deck = result.value.deck
  cardBackId = result.value.cardBackId
  battleMapId = result.value.battleMapId
  ai_username = result.value.ai_username

  # re-map deck for correct formatting and anti-cheat
  deck = _.map(deck, (card)->
    if _.isString(card) or _.isNumber(card)
      return { id: card }
    else if card.id?
      return { id: card.id }
  )

  # validate deck
  return Promise.all([
    # check whether user is allowed to use this deck
    UsersModule.isAllowedToUseDeck(userId, deck, GameType.BossBattle,null),
    # check whether user is allowed to use this card back
    (if cardBackId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, cardBackId) else Promise.resolve()),
    (if battleMapId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, battleMapId) else Promise.resolve())
  ])
  .bind {}
  .then ()->
    # TODO: get current boss general id and deck id from firebase
    aiGeneralId = result.value.ai_general_id
    aiDeckId = aiGeneralId

    # setup ai username from general name
    aiPlayerId = CONFIG.AI_PLAYER_ID
    aiGeneralCard = GameSession.getCardCaches().getCardById(aiGeneralId)
    aiUsername = ai_username || (aiGeneralCard?.getName()) || "Opponent"

    # get custom game setup options for boss
    gameSetupOptions = GameSetups[aiGeneralId]

    # create game
    return createSinglePlayerGame(userId,"You",GameType.BossBattle,deck,cardBackId,battleMapId,aiPlayerId,aiUsername,aiGeneralId,aiDeckId,1.0,0,null,gameSetupOptions)
  .then (responseData)-> # send data back to the player
    res.status(200).json(responseData)
  .catch Errors.InvalidDeckError, (error) ->
    Logger.module("BOSS BATTLE").debug "Request #{userId} : attempting to use invalid deck!".red
    return res.status(400).json({ error: error.message })
  .catch Errors.SinglePlayerModeDisabledError, (error)->
    Logger.module("BOSS BATTLE").debug "Request #{userId} : attempting to use invalid deck!".red
    return res.status(400).json({ error: error.message })
  .catch (error) ->
    Logger.module("BOSS BATTLE").error "ERROR: Request.post /boss_battle #{userId} failed!".red
    return next(error)

router.post "/share_replay", (req, res, next) ->
  game_id = t.validate(req.body.game_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not game_id.isValid()
    return next()

  user_id = req.user.d.id
  game_id = game_id.value

  GamesModule.shareReplay(user_id,game_id)
  .then (replayData)-> res.status(200).json(replayData)
  .catch Errors.AlreadyExistsError, (e)-> res.status(304).json({})
  .catch Errors.NotFoundError, (e)-> res.status(404).json(e)
  .catch (error) -> next(error)


module.exports = router
