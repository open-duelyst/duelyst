
UsersModule = require("../../server/lib/data_access/users")
knex = require("../../server/lib/data_access/knex")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
Promise = require("bluebird")

knex("users").select().then (userRows)->
  allPromises = []
  for row in userRows
    allPromises.push UsersModule.___hardWipeUserData(row.id)
  return Promise.all(allPromises)
.then ()->
  console.log("all done...")
  process.exit(1)
.catch (err)->
  throw err
  console.log("ERROR",err)
  process.exit(1)