express = require 'express'
Promise = require 'bluebird'
Logger = require '../../app/common/logger.coffee'
Errors = require '../lib/custom_errors'
DuelystFirebase = require '../lib/duelyst_firebase_module'
FirebasePromises = require '../lib/firebase_promises'
isSignedIn = require '../middleware/signed_in'
isFriend = require '../middleware/is_friend'
meRoutes = require './api/me'
usersRoutes = require './api/users'
replaysRoutes = require './api/replays/replays'
config = require '../../config/config'
t = require 'tcomb-validation'
types = require '../validators/types'
validators = require '../validators'

router = express.Router()

## Require authentication for all /api routes
router.use '/api', isSignedIn

# All users
# Requires users to be friends
# RANK, GAMES, STATS, FACTION PROGRESSION, RIBBONS PROGRESSION
router.use '/api/users/:user_id', isFriend
router.use '/api/users/:user_id/rank', usersRoutes.rank
router.use '/api/users/:user_id/games', usersRoutes.games
router.use '/api/users/:user_id/stats', usersRoutes.stats
router.use '/api/users/:user_id/faction_progression', usersRoutes.faction_progression
router.use '/api/users/:user_id/ribbons', usersRoutes.ribbons
router.use '/api/users/:user_id/rift', usersRoutes.rift

# Me user
# RANK, INVENTORY, ARENA, CHALLENGES, QUESTS, REWARDS, NEW PLAYER PROGRESSION,
# DECKS, ACHIEVEMENTS, SHOP, STATS, PROFILE, GAMES, GIFT CRATE, SPECTATE TOKENS,
# FACTION PROGRESSION, RIBBONS PROGRESSION
router.use '/api/me/rank', meRoutes.rank
router.use '/api/me/inventory', meRoutes.inventory
router.use '/api/me/gauntlet/runs', meRoutes.gauntlet
router.use '/api/me/challenges', meRoutes.challenges
router.use '/api/me/quests', meRoutes.quests
router.use '/api/me/rewards', meRoutes.rewards
router.use '/api/me/new_player_progression', meRoutes.new_player_progression
router.use '/api/me/decks', meRoutes.decks
router.use '/api/me/achievements', meRoutes.achievements
router.use '/api/me/shop', meRoutes.shop
router.use '/api/me/stats', meRoutes.stats
router.use '/api/me/profile', meRoutes.profile
router.use '/api/me/games', meRoutes.games
router.use '/api/me/crates', meRoutes.crates
router.use '/api/me/spectate', meRoutes.spectate
router.use '/api/me/faction_progression', meRoutes.faction_progression
router.use '/api/me/ribbons', meRoutes.ribbons
router.use '/api/me/gift_codes', meRoutes.gift_codes
router.use '/api/me/referrals', meRoutes.referrals
router.use '/api/me/rift', meRoutes.rift

# replays API (anyone can call it)
router.use '/replays', replaysRoutes

# QA / Testing
if config.isDevelopment()
  router.use '/api/me/qa', meRoutes.qa

  # Just a route for secure testing
  router.get "/api/me/securetest", (req, res, next) ->
    Logger.module("API").log "user calling api/securetest #{req.user}"
    return res.status(200).end()

# REPORTING
router.post "/api/me/report_player", (req, res, next) ->
  result = t.validate(req.body, validators.reportPlayerInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  other_user_id = result.value.user_id
  message = result.value.message
  res.status(404).send('Player reporting is not currently implemented.')

  #DuelystFirebase.connect().getRootRef()
  #.then (rootRef) ->
  #  return FirebasePromises.once(rootRef.child('users').child(other_user_id).child('username'),'value')
  #.then (snapshot) ->
  #  username = snapshot.val()
  #  # TODO: Do something with player reports.
  #.catch (error) ->
  #  Logger.module("API").error "Failed to send player report."

module.exports = router
