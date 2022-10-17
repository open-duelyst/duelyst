Promise = require 'bluebird'
_ = require 'underscore'
r = require '../r-client'
tk = require('../r-tokenmanager')(r)

playerId1 = "tonyfoo"
playerId2 = "tonytwo"
lock1 = tk.lock(playerId1).catch((err)->console.log err)
lock2 = tk.lock(playerId2).catch((err)->console.log err)
unlock1 = null
unlock2 = null

checklocks = () ->
  isLocked1 = tk.isLocked(playerId1)
  isLocked2 = tk.isLocked(playerId2)
  Promise.join isLocked1, isLocked2,
  (locked1, locked2) ->
    console.log "lock1 is #{locked1}"
    console.log "lock2 is #{locked2}"

locks = Promise.join lock1,lock2,
(unlockFn1,unlockFn2) ->
  console.log "lock1 acquired: " + _.isFunction(unlockFn1)
  console.log "lock2 acquired: " + _.isFunction(unlockFn2)
  unlock1 = Promise.promisify(unlockFn1)
  unlock2 = Promise.promisify(unlockFn2)
.then () ->
  console.log "locking done..."
  checklocks()
  return Promise.join unlock1(),unlock2(),
  (result1, result2) ->
    console.log "unlock1 success: " + Boolean(result1)
    console.log "unlock2 success: " + Boolean(result1)
  .then () ->
    console.log "unlocking done..."
    checklocks()
  
