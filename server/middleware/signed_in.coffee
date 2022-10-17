express = require 'express'
expressJwt = require 'express-jwt'
compose = require('compose-middleware').compose
t = require 'tcomb-validation'
validators = require '../validators'
config = require '../../config/config'

###
Any route that requires authentication can use this middleware
Middleware will validate JWT security and expiration
Then ensure both an ID and maybe(username) are present in the JWT payload
We can add additional checks to the JWT payload here
###
module.exports = compose([
  expressJwt({
    algorithms: ["HS256"], # Will be passed to jsonwebtoken.verify().
    secret: config.get('firebase.legacyToken')
  }),
  (req, res, next) ->
    result = t.validate(req.user.d, validators.token)
    if not result.isValid()
      return res.status(400).json(result.errors)
    else
      return next()
])
