express = require 'express'
router = express.Router()

util = require 'util'
Logger = require '../../app/common/logger.coffee'
Promise = require 'bluebird'
moment = require 'moment'
hashHelpers = require '../lib/hash_helpers.coffee'
knex = require '../lib/data_access/knex'
t = require 'tcomb-validation'
types = require '../validators/types'
UsersModule = require '../lib/data_access/users'

# our modules
mail = require '../mailer'
Promise.promisifyAll(mail)
Errors = require '../lib/custom_errors.coffee'

# Configuration object
config = require '../../config/config.js'

###
GET Reset Token
###
router.get "/verify/:verify_token", (req, res, next) ->
	result = t.validate(req.params.verify_token, types.UUID)
	if not result.isValid()
		return next()

	verify_token = result.value

	UsersModule.verifyEmailUsingToken(verify_token)
	.then ()->
		# Render the verified template
		return res.format({
			'text/html': () ->
				res.render(__dirname + "/../templates/verified.hbs",{
					title: "Account Verified"
				})
			'application/json': () ->
				res.status(204).end()
		})
	.catch Errors.NotFoundError, () ->
		# 404 it
		return next()
	.catch (e) -> next(e)

module.exports = router
