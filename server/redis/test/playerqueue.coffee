Promise = require 'bluebird'
_ = require 'underscore'
r = require '../r-client'
queue = require '../r-playerqueue'

q = new queue(r)
#console.log(q)

playerId1 = "tonyfoo"
playerId2 = "tonytwo"
divisions = ["bronze","silver","gold","diamond","elite"]
randomDurationMs = () -> (Math.floor(Math.random() * 10) + 1) * 60000

# queue player 1
# then count, search, grab
player1 = q.add(playerId1, 25)
count = player1.then(()->q.count())
search = player1.then(()->q.search())
grab = player1.then(()->q.grab())
# get results of all
queueUp1 = Promise.all([count,search,grab]).then((results)->console.log results)

# queue player 2
# then count, search, grab
player2 = q.add(playerId2, 25)
count = player2.then(()->q.count())
search = player2.then(()->q.search())
grab = player2.then(()->q.grab())
# get results of all
queueUp2 = Promise.all([count,search,grab]).then((results)->console.log results)

# mark a bunch of matches as made
markHits = Promise.all([queueUp1,queueUp2]).then () ->
  # mark 100 matches as 'hits' for random divisions
  for i in [1..100]
    q.matchMade(_.sample(divisions), randomDurationMs())

markHits.then () ->
  console.log('marking hits done')
  Promise.map divisions, (division) ->
    console.log("getting queue velocity for #{division}")
    return q.velocity(division)
    # .then (result) ->
    #   console.log result
    #   return result
  .then (results) ->
    # console.log results
    minutes = _.map results, (value) ->
      value / 60000
    # console.log minutes
