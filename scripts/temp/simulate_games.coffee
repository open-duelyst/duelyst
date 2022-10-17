_ = require 'underscore'
util = require 'util'
SDK = require '../../app/sdk'
knex = require("../../server/lib/data_access/knex")
Promise = require 'bluebird'
UsersModule = require "../../server/lib/data_access/users"
RankModule = require "../../server/lib/data_access/rank"
GamesModule = require "../../server/lib/data_access/games"
generatePushId = require("../../app/common/generate_push_id")
{Redis, Jobs, GameManager} = require '../../server/redis/'
GameType = require '../../app/sdk/gameType'
GameSetup = require '../../app/sdk/gameSetup'

# Update User Ranking, Progression, Quests, Stats
updateUser = (gameSession, userId, gameId, factionId, isWinner, isDraw) ->

  # check for isFriendly
  # check for isUnscored
  isFriendly = gameSession.isFriendly()
  isUnscored = false

  console.log "starting job..."

  # start the job to process the game for a user
  Jobs.create("update-user-post-game",
    name: "Update User Game"
    title: util.format("User %s :: Game %s", userId, gameId)
    userId: userId
    gameId: gameId
    gameType: gameSession.gameType
    factionId: factionId
    isWinner: isWinner
    isDraw: isDraw
    isUnscored: isUnscored
  ).removeOnComplete(true).save()

startAGame = ()->

  console.log "starting game..."

  users = _.sample(userIds,2)
  if _.contains(usersInGame,users[0]) or _.contains(usersInGame,users[1])
    # startAGame()
    return

  console.log "started game for #{users}"

  # mark users as in-game
  usersInGame.push(users[0])
  usersInGame.push(users[1])

  # set up game session
  gs = SDK.GameSession.create()
  gs.setIsRunningAsAuthoritative(true)
  gs.gameId = generatePushId()
  gs.gameType = GameType.Ranked
  GameSetup.setupNewSession(gs,{userId:users[0],deck:[1,9,9,9]},{userId:users[1],deck:[1,9,9,9]})

  # resign
  player = gs.getPlayerById(users[1])
  resignAction = player.actionResign()
  gs.executeAction(resignAction)

  data = gs.serializeToJSON()

  GameManager.saveGameSession(gs.gameId,data).then ()->

    updateUser(gs,users[0],gs.gameId,1,true,false)
    updateUser(gs,users[1],gs.gameId,1,false,false)

    usersInGame = _.without(usersInGame,[users[0],users[1]])

userIds = []
usersInGame = []

knex("users").select('id').where('username', 'like', '%unit-test%').then (ids)->
  console.log "fetched user IDs"
  userIds = _.map(ids,(userRow)-> return userRow.id)
  setInterval(startAGame,300)
