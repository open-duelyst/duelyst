express = require 'express'
expressJwt = require 'express-jwt'
router = express.Router()
compose = require('compose-middleware').compose
config = require '../../config/config'
DuelystFirebase = require '../lib/duelyst_firebase_module'
FirebasePromises = require '../lib/firebase_promises'
t = require 'tcomb-validation'
types = require '../validators/types'

###
Make sure users routes have a User ID parameter
###
module.exports = (req, res, next) ->
  result = t.validate(req.params.user_id, types.UserId)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = result.value
  requrester_id = req.user.d.id

  # a user can read their own data
  if user_id == requrester_id
    req.user_id = user_id
    return next()

  return DuelystFirebase.connect().getRootRef()
  .bind {}
  .then (fbRootRef)->
    @.fbRootRef = fbRootRef
    return FirebasePromises.once(@.fbRootRef.child('users').child(requrester_id).child('buddies').child(user_id),'value')
  .then (snapshot)->
    if snapshot.val()?
      req.user_id = user_id
      next()
    else
      return res.status(401).json({message: "You are not authorized to view this player's data."})
