Promise = require 'bluebird'
_ = require 'underscore'
r = require '../r-client'
tk = require('../r-tokenmanager')(r)

###
Simulates searching for a lock when given an array of player ids
Some players may be locked so it continues until it finds a lock
###
findLock = (players) ->
  if players.length == 0
    console.log "No locks found..."
    return null

  #console.log "Players: " + players
  console.log "Attempting to lock: #{players[0]}"

  return tk.lock(players[0]).then((unlock)->
    if _.isFunction(unlock)
      console.log "Lock acquired: #{players[0]}"
      return {locked: players[0], unlock: unlock}
    else
      players = players.slice(1)
      return findLock(players)
  )

# List of a players
# Randomly lock two of them
players = ['p6','p2','p3','p4','p5','p1','p7']
locked = _.sample(players,2)
randomlock1 = tk.lock(locked[0],250).catch((err)->console.log err)
randomlock2 = tk.lock(locked[1],250).catch((err)->console.log err)

# Wait till locking is complete
Promise.join randomlock1, randomlock2, () ->
  console.log "Randomly locked players: #{locked}"
  # Call find lock on array of players
  findLock(players).then (lock) ->
    console.log "findLock() done: #{JSON.stringify(lock)}"
