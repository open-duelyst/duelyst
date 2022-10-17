_ = require 'underscore'
express = require 'express'
jwt = require 'jsonwebtoken'
knex = require 'server/lib/data_access/knex'
DataAccessHelpers = require 'server/lib/data_access/helpers'
FirebasePromises = require 'server/lib/firebase_promises'
DuelystFirebase = require 'server/lib/duelyst_firebase_module'
Logger = require 'app/common/logger.coffee'
Errors = require 'server/lib/custom_errors'
config = require 'config/config'
t = require 'tcomb-validation'
types = require 'server/validators/types'
Consul = require 'server/lib/consul'
Promise = require 'bluebird'

router = express.Router()

# router.get "/token", (req, res, next) ->
#   user_id = req.user.d.id
#
#   return knex("users").first('username').where('id',user_id)
#   .bind {}
#   .then (userRow) -> @.username = userRow.username
#   .then () -> DuelystFirebase.connect().getRootRef()
#   .then (rootRef) ->
#     return FirebasePromises.once(rootRef.child("users").child(user_id).child("buddies"),"value")
#   .then (snapshot) ->
#     buddies = snapshot.val()
#     buddyIds = _.keys(buddies)
#
#     payload =
#       b: buddyIds
#       u: @.username
#       iat: Math.floor(new Date().getTime() / 1000)
#
#     options =
#       expiresIn: 30
#       algorithm: 'HS256'
#
#     # We are encoding the payload inside the token
#     token = jwt.sign(payload, config.get('firebase.legacyToken'), options)
#     res.status(200).json(token)
#
#   .catch (error) -> next(error)

router.get "/:player_id", (req, res, next) ->
  result = t.validate(req.params.player_id, types.UserId)
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  player_id = result.value

  systemStatusPromise = Promise.resolve({
    spectate: {
      enabled: true
    }
  })

  if config.get('consul.enabled')
    systemStatusPromise =
      Consul.kv.get("environments/#{process.env.NODE_ENV}/runtime-system-configuration.json")
      .then JSON.parse

  systemStatusPromise
  .bind {}
  .then (consulSystemRuntimeParams)->
    if not consulSystemRuntimeParams?.spectate?.enabled
      throw new Errors.SystemDisabledError("The spectate system is temporarily disabled.")
  .then ()-> return knex("users").first('username').where('id',user_id)
  .then (userRow) -> @.username = userRow.username
  .then () -> return knex("users").first('username').where('id',player_id)
  .then (userRow) -> @.buddyName = userRow.buddyName
  .then ()-> knex("user_games").where("user_id",player_id).orderBy('created_at','desc').first()
  .then (gameRow)->
    if gameRow["ended_at"]?
      throw new Errors.NotFoundError("The player's last game is over.")
    else
      @.gameRow = gameRow
  .then () ->
    return DuelystFirebase.connect().getRootRef()
  .then (rootRef) ->
    return Promise.all([
      FirebasePromises.once(rootRef.child("users").child(user_id).child("buddies"),"value"),
      FirebasePromises.once(rootRef.child("users").child(player_id).child("blockSpectators"),"value")
    ])
  .spread (buddiesSnapshot,blockSpectatorsSnapshot) ->
    buddies = buddiesSnapshot.val()
    buddyIds = _.keys(buddies)

    if blockSpectatorsSnapshot.val()
      throw new Errors.UnauthorizedError("This user has blocked spectators.")

    if not _.contains(buddyIds,player_id)
      throw new Errors.NotFoundError("You must be buddies with #{@.buddyName} to spectate this game.")

    payload =
      b: buddyIds
      u: @.username
      iat: Math.floor(new Date().getTime() / 1000)

    options =
      expiresIn: 30
      algorithm: 'HS256'

    # We are encoding the payload inside the token
    @.token = jwt.sign(payload, config.get('firebase.legacyToken'), options)
  .then ()->
    responseData =
      gameData: DataAccessHelpers.restifyData(@.gameRow)
      token: @.token
    res.status(200).json(responseData)
  .catch Errors.UnauthorizedError, (error)->
    return res.status(500).json({ message: error.message })
  .catch Errors.SystemDisabledError, (error)->
    return res.status(400).json({ message: error.message })
  .catch (error) -> next(error)

module.exports = router
