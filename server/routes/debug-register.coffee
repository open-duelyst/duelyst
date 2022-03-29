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
tcomb = require 'tcomb'
types = require '../validators/types'
validators = require '../validators'
fetch = require 'isomorphic-fetch'

config = require '../../config/config'
bnea = require('../lib/bnea')({
	apiUrl: config.get('bnea.apiUrl'),
	appId: config.get('bnea.serverAppId'),
	appSecret: config.get('bnea.serverAppSecret')
})

router.get "/debug-bnea-register", (req, res, next) ->
	return res.render(__dirname + "/../templates/debug-register-bnea.hbs", {})

router.get "/debug-duelyst-register", (req, res, next) ->
	return res.render(__dirname + "/../templates/debug-register-duelyst.hbs", {})
	
router.get "/debug-bnea-unlink", (req, res, next) ->
	return res.render(__dirname + "/../templates/debug-bnea-unlink.hbs", {})

router.post "/debug-duelyst-register", (req, res, next) ->
	result = t.validate(req.body, tcomb.struct({
		password: types.NewPassword,
		email: types.Email,
		username: types.Username
	}))
	
	if not result.isValid()
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-duelyst.hbs",{
					error: result.errors
				})
			'application/json': () ->
				return res.status(400).json(result.errors)
		})
		
	password = result.value.password
	email = result.value.email.toLowerCase()
	username = result.value.username.toLowerCase()
	
	return UsersModule.createNewUser(email,username,password,null,null,null,null)
	.then (userId) ->
		Logger.module("duelyst-register").log "[#{userId}] #{email} created".green
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-created.hbs",{
					user: JSON.stringify({
						id: userId
						username: username
						email: email
						password: password
					})
				})
			'application/json': () ->
				return res.status(200).json({})
		})
	.catch (e) ->
		Logger.module("duelyst-register").error "#{e.message}".red
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-duelyst.hbs",{
					error: e.message
				})
			'application/json': () ->
				return res.status(500).json(e)
		})


router.post "/debug-bnea-register", (req, res, next) ->
	result = t.validate(req.body, tcomb.struct({
		password: types.NewPassword,
		email: types.Email
	}))
	
	if not result.isValid()
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-bnea.hbs",{
					error: result.errors
				})
			'application/json': () ->
				return res.status(400).json(result.errors)
		})

	password = result.value.password
	email = result.value.email.toLowerCase()

	return bnea.register({
		email: email,
		password: password,
		birthdate_year: 1999, 
		birthdate_month: 12, 
		birthdate_day: 31
	})
	.bind {}
	.then (data) ->
		Logger.module("bnea-register").log "#{email} created".green
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-created.hbs",{
					user: JSON.stringify({
						email: email
						password: password
					})
				})
			'application/json': () ->
				return res.status(200).json({})
		})
	.catch (e) ->
		Logger.module("bnea-register").error "[#{e.status}][#{e.innerMessage}] #{e.code} #{e.codeMessage}".red
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-register-bnea.hbs",{
					error: "[#{e.status}][#{e.innerMessage}] #{e.code} #{e.codeMessage}"
				})
			'application/json': () ->
				return res.status(e.status || 500).json(e)
		})

router.post "/debug-bnea-unlink", (req, res, next) ->
	result = t.validate(req.body, tcomb.struct({
		email: types.Email
	}))
	
	if not result.isValid()
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-bnea-unlink.hbs",{
					error: result.errors
				})
			'application/json': () ->
				return res.status(400).json(result.errors)
		})

	email = result.value.email.toLowerCase()
	
	UsersModule.userDataForEmail(email)
	.then (userData) ->
		if !userData
			return res.format({
				'text/html': () ->
					return res.render(__dirname + "/../templates/debug-bnea-unlink.hbs",{
						error: 'No user found with that email'
					})
				'application/json': () ->
					return res.status(404).json({})
			})
		if !userData.bnea_id
			return res.format({
				'text/html': () ->
					return res.render(__dirname + "/../templates/debug-bnea-unlink.hbs",{
						error: 'No BNEA link found for that user'
					})
				'application/json': () ->
					return res.status(404).json({})
			})
		return UsersModule.disassociateBneaId(userData.id)
	.catch (e) ->
		return res.format({
			'text/html': () ->
				return res.render(__dirname + "/../templates/debug-bnea-unlink.hbs",{
					error: e.message
				})
			'application/json': () ->
				return res.status(500).json(e)
		})

module.exports = router
