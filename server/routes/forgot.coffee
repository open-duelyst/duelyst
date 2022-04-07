express = require 'express'
router = express.Router()
util = require 'util'
Logger = require '../../app/common/logger.coffee'
Promise = require 'bluebird'
uuid = require 'node-uuid'
moment = require 'moment'
hashHelpers = require '../lib/hash_helpers.coffee'
knex = require '../lib/data_access/knex'
mail = require '../mailer'
Promise.promisifyAll(mail)
UsersModule = require '../lib/data_access/users'
Errors = require '../lib/custom_errors.coffee'
t = require 'tcomb-validation'
types = require '../validators/types'

###
The forgot password section is different than all other routes
in that it supports both HTML and JSON. The HTML page is available
on /forgot directly and renders server-side HBS templates.
###
router.get "/forgot", (req, res, next) ->
	return res.format({
		'text/html': () ->
			return res.render(__dirname + "/../templates/forgot-password.hbs",{
				title: "Forgot Password"
			})
		'application/json': () ->
			return next()
	})

router.post "/forgot", (req, res, next) ->
	result = t.validate(req.body.email, types.Email)
	if not result.isValid()
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/forgot-password.hbs",{
					title: "Forgot Password",
					error: "That email was not found."
				})
			'application/json': () ->
				return res.status(400).json(result.errors)
		})

	email = result.value.toLowerCase()

	# Create Reset Token + Send Reset Email
	UsersModule.userDataForEmail(email)
	.bind {}
	.then (userData) ->
		if !userData
			res.format({
				'text/html': () ->
					return res.render(__dirname + "/../templates/forgot-password.hbs",{
						title: "Forgot Password",
						error: "User not found"
					})
				'application/json': () ->
					return res.status(404).json({})
			})
		else
			@userId = userData.id
			@username = userData['username']
			@resetToken = uuid.v4()
			return knex("password_reset_tokens").insert({ reset_token:@resetToken, user_id:@userId, created_at:moment().utc().toDate() })
			.bind @
			.then () =>
				mail.sendForgotPasswordAsync(@username, email, @resetToken)
				Logger.module("SESSION").debug "Forgot password mail sent"
				return res.format({
					'text/html': () ->
						return res.render(__dirname + "/../templates/sent-reset.hbs",{
							title: "Email Sent"
						})
					'application/json': () ->
						return res.status(200).json({})
				})
	.catch (e) -> next(e)

router.get "/forgot/:reset_token", (req, res, next) ->
	result = t.validate(req.params.reset_token, types.UUID)
	if not result.isValid()
		return next()

	reset_token = result.value

	# Lookup token here
	knex("password_reset_tokens").first().where('reset_token',reset_token)
	.bind {}
	.then (resetTokenData) ->
		unless resetTokenData?.user_id
			throw new Errors.NotFoundError()
		@.resetTokenData = resetTokenData
		return knex('users').where('id',resetTokenData.user_id).first()
	.then (userData) ->
		# Validate token against expiration
		# Allow reset view if OK
		if !userData
			throw new Errors.NotFoundError()
		else
			userId = userData.id
			email = userData['email']
			expires = moment.utc(@.resetTokenData.created_at).add(1,'days').valueOf()
			now = moment().utc().valueOf()
			if (now > expires)
				# Invalidate / delete token
				# Render the expired template
				return res.format({
					'text/html': () ->
						res.status(403)
						res.render(__dirname + "/../templates/expired-reset.hbs",{
							title: "Reset Link Expired"
						})
					'application/json': () ->
						res.status(403).end()
				})
			else
				# Render the reset template
				return res.format({
					'text/html': () ->
						res.render(__dirname + "/../templates/new-password.hbs",{
							title: "New Password"
							resetToken: reset_token
						})
					'application/json': () ->
						res.status(204).end()
				})

	.catch Errors.NotFoundError, () ->
		# 404 it
		next()
	.catch (e) -> next(e)

router.post "/forgot/:reset_token", (req, res, next) ->
	reset_token = t.validate(req.params.reset_token, types.UUID)
	if not reset_token.isValid()
		return next()

	password = t.validate(req.body.password, types.NewPassword)
	if not password.isValid()
		return res.format({
			'text/html': () ->
				res.status(400)
				res.render(__dirname + "/../templates/new-password.hbs",{
					title: "New Password"
					error: "Invalid password."
					resetToken: reset_token
				})
			'application/json': () ->
				res.status(400).end()
		})

	password = password.value
	reset_token = reset_token.value

	# Lookup token here
	knex("password_reset_tokens").first().where('reset_token',reset_token)
	.bind {}
	.then (resetTokenData) ->
		unless resetTokenData?.user_id
			throw new Errors.NotFoundError()
		@.resetTokenData = resetTokenData
		return knex('users').where('id',resetTokenData.user_id).first()
	.then (userData) ->
		# Validate token against expiration
		# Allow reset view if OK
		if !userData
			throw new Errors.NotFoundError()
		else
			userId = userData.id
			email = userData['email']
			username = userData['username']
			expires = moment.utc(@.resetTokenData.created_at).add(1,'days').valueOf()
			now = moment().utc().valueOf()
			if (now > expires)
				# Invalidate / delete token
				# Render the expired template
				return res.format({
					'text/html': () ->
						res.status(403)
						res.render(__dirname + "/../templates/expired-reset.hbs",{
							title: "Reset Link Expired"
						})
					'application/json': () ->
						res.status(403).end()
				})
			else
				# Update the password
				# generateHash function returns hash for saving in DB
				return hashHelpers.generateHash(password)
				.then (hash) ->
					return Promise.all([
						knex('users').where('id',userId).update({ password: hash, password_updated_at: moment().utc().toDate() })
						knex("password_reset_tokens").where('reset_token',reset_token).delete()
					])
				.then () ->
					mail.sendPasswordConfirmationAsync(username, email)
					return res.format({
						'text/html': () ->
							res.render(__dirname + "/../templates/password-changed.hbs",{
								title: "Password Changed"
							})
						'application/json': () ->
							res.status(204).end()
					})
	.catch Errors.NotFoundError, () ->
		# 404 it
		next()
	.catch (e) -> next(e)

module.exports = router
