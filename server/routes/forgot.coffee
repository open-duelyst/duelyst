express = require 'express'

router = express.Router()

router.get "/forgot", (req, res, next) ->
  return res.status(400).send('Password reset is not currently supported.')

router.post "/forgot", (req, res, next) ->
  return res.status(400).send('Password reset is not currently supported.')

router.get "/forgot/:reset_token", (req, res, next) ->
  return res.status(400).send('Password reset is not currently supported.')

router.post "/forgot/:reset_token", (req, res, next) ->
  return res.status(400).send('Password reset is not currently supported.')

module.exports = router
