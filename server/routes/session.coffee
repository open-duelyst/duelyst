express = require 'express'
router = express.Router()

util = require 'util'
Logger = require '../../app/common/logger'
generatePushId = require '../../app/common/generate_push_id'
_ = require 'underscore'
bcrypt = require 'bcrypt'
crypto = require 'crypto'
jwt = require 'jsonwebtoken'
expressJwt = require 'express-jwt'
Promise = require 'bluebird'
uuid = require 'node-uuid'
moment = require 'moment'
hashHelpers = require '../lib/hash_helpers'
Steam = require '../lib/steam'
DataAccessHelpers = require '../lib/data_access/helpers'
Errors = require '../lib/custom_errors'
isSignedIn = require '../middleware/signed_in'
t = require 'tcomb-validation'
validators = require '../validators'
types = require '../validators/types'
fetch = require 'isomorphic-fetch'
formurlencoded= require 'form-urlencoded'
DiscourseSSO = require('discourse-sso')
knex = require '../lib/data_access/knex'

# our modules
mail = require '../mailer'
Promise.promisifyAll(mail)
UsersModule = require '../lib/data_access/users'
ReferralsModule = require '../lib/data_access/referrals'
InventoryModule = require '../lib/data_access/inventory'
SyncModule = require '../lib/data_access/sync'
AnalyticsUtil = require '../../app/common/analyticsUtil'

# Configuration object
config = require '../../config/config'
firebaseToken = config.get('firebaseToken')
{version} = require '../../version'

discourseSSO = new DiscourseSSO(config.get("discourse.ssoSecret"))

# BNEA library and config
bnea = require('../lib/bnea')({
	apiUrl: config.get('bnea.apiUrl'),
	appId: config.get('bnea.serverAppId'),
	appSecret: config.get('bnea.serverAppSecret')
})

###
Get a user's data by steam ticket or error
###
userForSteamTicket = (steamTicket) ->
	data = {
		steamId: null
		userId: null
		userData: null
	}
	return Steam.authenticateUserTicket(steamTicket)
	.then (steamId) ->
		data.steamId = steamId
		return UsersModule.userIdForSteamId(steamId)
	.then (userId) ->
		if !userId
			return data
		data.userId = userId
		return UsersModule.userDataForId(userId)
	.then (userData) ->
		data.userData = userData
		return data

###
Build analytics data from user data
###
analyticsDataFromUserData = (userRow) ->
	analyticsData = {}
	if userRow.campaign_source?
		analyticsData.campaign_source = userRow.campaign_source
	if userRow.campaign_medium?
		analyticsData.campaign_medium = userRow.campaign_medium
	if userRow.campaign_term?
		analyticsData.campaign_term = userRow.campaign_term
	if userRow.campaign_content?
		analyticsData.campaign_content = userRow.campaign_content
	if userRow.campaign_name?
		analyticsData.campaign_name = userRow.campaign_name
	if userRow.referrer?
		analyticsData.referrer = userRow.referrer
	if userRow.first_purchased_at?
		analyticsData.first_purchased_at = userRow.first_purchased_at
	if userRow.seen_on_days?
		AnalyticsUtil.convertDaysSeenOnFromArrayToObject(userRow.seen_on_days,analyticsData)
	if userRow.last_session_at?
		analyticsData.last_session_at = userRow.last_session_at
	return analyticsData

###
Log a user in (firing sync jobs) and generate a response (token)
Possibly add param in return data to say username is null? OR just allow client to decode token
###
logUserIn = (id) ->
	return UsersModule.userDataForId(id)
	.bind {}
	.then (data) ->
		if !data?
			throw new Errors.NotFoundError()

		if data.is_suspended
			throw new Errors.AccountDisabled("This account has been suspended. Reason: #{data.suspended_memo}")

		payload =
			d:
				id: id
				username: data.username || null
			v: 0
			iat: Math.floor(new Date().getTime() / 1000)
		options =
			expiresInMinutes: config.get('tokenExpiration')
			algorithm: 'HS256'

		@token = jwt.sign(payload, firebaseToken, options)
		@analyticsData = analyticsDataFromUserData(data)
		@bneaAssociatedAt = data.bnea_associated_at
		@bneaId = data.bnea_id
		return UsersModule.bumpSessionCountAndSyncDataIfNeeded(id, data)
	.then (synced) ->
		@synced = synced
		return UsersModule.createDaysSeenOnJob(id)
	.then () ->
		return {
			token: @token,
			synced: @synced,
			analytics_data: @analyticsData,
			bnea_associated_at: @bneaAssociatedAt,
			bnea_id: @bneaId
		}

###
Log a user in using BNEA credentials and generate response (token) which also includes BNEA token
Assumes the idForBneaId exists (BNEA link created) or will throw a NotFoundError
###
logUserInByBnea = (email, password, clientIp = null) ->
	return bnea.login({email, password}, clientIp)
	.bind {}
	.then (res) ->
		@bneaLoginData = res.body.data
		return bnea.validateToken(@bneaLoginData.access_token, clientIp)
	.then (res) ->
		@validatedTokenData = res.body.data
		return UsersModule.userIdForBneaId(@validatedTokenData.id)
	.then (idForBneaId) ->
		# no id found, throw 404
		if !idForBneaId
			throw new Errors.NotFoundError()

		# if we have an existing bnea id, we login user in
		return logUserIn(idForBneaId)
	.then (data) ->
		return {
			token: data.token,
			bnea_token: @bneaLoginData.access_token,
			bnea_refresh: @bneaLoginData.refresh_token,
			bnea_id: @validatedTokenData.id,
			analytics_data: data.analytics_data
		}
	.catch (e) ->
		Logger.module('BNEA').log('logUserInByBnea failed')
		Logger.module('BNEA').log("[Status #{e.status}] #{e.innerMessage}: #{e.codeMessage}")
		# Let's stick the data on the error object for the case where the user does not exist (404)
		if @bneaLoginData && @validatedTokenData
			e.bneaLoginData = @bneaLoginData
			e.bneaValidatedTokenData = @validatedTokenData
		throw e

###
Log a user in into BNEA
Returns merged object containing {@bneaLogin, @token, @account, @balance}
###
loginBnea = (loginData, clientIp = null) ->
	return bnea.login(loginData, clientIp)
	.bind {}
	.then (data) ->
		@bneaLogin = data.body.data
		return Promise.all([
			bnea.validateToken(data.body.data.access_token, clientIp),
			bnea.accountInfo(data.body.data.access_token, clientIp)
		])
	.spread (token, account) ->
		@token = token.body.data
		@account = account.body.data
		return {@bneaLogin, @token, @account}
	.catch (e) ->
		Logger.module('BNEA').log('loginBnea failed')
		Logger.module('BNEA').log("[Status #{e.status}] #{e.innerMessage}: #{e.codeMessage}")
		throw e

###
Log a user in into BNEA by Steam Ticket
Returns merged object containing {@bneaLogin, @token, @account, @balance}
###
loginBneaBySteam = (steamId, steamTicket, clientIp = null) ->
	return bnea.steamLogin({
		steam_appid: parseInt(config.get('steam.appId')),
		steam_id: steamId,
		steam_session_ticket: steamTicket
	}, clientIp)
	.bind {}
	.then (data) ->
		@bneaLogin = data.body.data
		return Promise.all([
			bnea.validateToken(data.body.data.access_token, clientIp),
			bnea.accountInfo(data.body.data.access_token, clientIp)
		])
	.spread (token, account) ->
		@token = token.body.data
		@account = account.body.data
		return {@bneaLogin, @token, @account}
	.catch (e) ->
		Logger.module('BNEA').log('loginBneaBySteam failed')
		Logger.module('BNEA').log("[Status #{e.status}] #{e.innerMessage}: #{e.codeMessage}")
		# return null here so we can check fail condition easily
		# steam login basically either passes or fails
		return null

###
Create a new BNEA user and log in
Returns merged object containing {@loginData, @tokenData}
###
createAndLoginBneaUser = (registerData, clientIp = null) ->
	# Create BNEA user here
	return bnea.register({
		email: registerData.email,
		password: registerData.password,
		birthdate_year: registerData.birthdate_year,
		birthdate_month: registerData.birthdate_month,
		birthdate_day: registerData.birthdate_day,
		subscriptions: registerData.subscriptions
		source: registerData.source
	}, clientIp)
	.bind {}
	# We need to log the user into BNEA so we can get their user uid
	.then (data) ->
		return bnea.login({
			email: registerData.email,
			password: registerData.password
		}, clientIp)
	.then (data) ->
		@bneaLogin = data.body.data
		return bnea.validateToken(@bneaLogin.access_token, clientIp)
	.then (data) ->
		@token = data.body.data
		return {@bneaLogin, @token}
	.catch (e) ->
		Logger.module('BNEA').log('createAndLoginBneaUser failed')
		Logger.module('BNEA').log("[Status #{e.status}] #{e.innerMessage}: #{e.codeMessage}")
		throw e

###
GET handler for session status
Validates current session used by user
Generates a fresh token by logging the user in
###
router.get "/session/", isSignedIn, (req, res, next) ->
	user_id = req.user.d.id

	return logUserIn(user_id)
	.bind {}
	.then (data) ->
		return res.status(200).json(data)
	.catch Errors.NotFoundError, (e) ->
		return res.status(401).json({})
	.catch Errors.AccountDisabled, (e) ->
		return res.status(401).json({message: e.message})
	.catch (e) ->
		next(e)

###
POST handler for session login
Log users in
###
router.post "/session/", (req, res, next) ->
	result = t.validate(req.body, validators.loginInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email?.toLowerCase()
	username = result.value.username?.toLowerCase()

	getUserIdAsync = if username then UsersModule.userIdForUsername(username) else UsersModule.userIdForEmail(email)

	getUserIdAsync
	.bind {}
	.then (id) -> # Step 2 : check if user exists
		if !id
			throw new Errors.NotFoundError()

		@id = id
		return UsersModule.userDataForId(id)
	.then (data) -> # check password valid
		@.userRow = data
		if data.is_suspended
			throw new Errors.AccountDisabled("This account has been suspended. Reason: #{data.suspended_memo}")
		return hashHelpers.comparePassword(password, data.password)
	.then (match) ->
		if (!match)
			throw new Errors.BadPasswordError()
		else
			# Firebase expects payload with following items:
			# d: profile data encoded in token, becomes accessible by Firebase security rules
			# v: version number (0)
			# iat : issued at time in seconds since epoch
			payload =
				d:
					id: @id
					email: @.userRow.email
					username: @.userRow.username
				v: 0
				iat: Math.floor(new Date().getTime() / 1000)

			# Token creation options are :
			# algorithm (default: HS256)
			# expiresInMinutes
			# audience
			# subject
			# issuer
			options =
				expiresInMinutes: config.get('tokenExpiration')
				algorithm: 'HS256'

			# We are encoding the payload inside the token
			@.token = jwt.sign(payload, firebaseToken, options)

			# make a db transaction/ledger event for the login
			# UsersModule.logEvent(@id,"session","login")

			return UsersModule.bumpSessionCountAndSyncDataIfNeeded(@.id,@.userRow)
	.then ()->
		return UsersModule.createDaysSeenOnJob(@id)
	.then ()->
		analyticsData = analyticsDataFromUserData(@userRow)
		# Send token
		# Send back BNEA link status
		return res.status(200).json({token: @.token, analytics_data: analyticsData, bnea_associated_at: @.userRow.bnea_associated_at})
	.catch Errors.AccountDisabled, (e) ->
		return res.status(401).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch Errors.BadPasswordError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch (e) -> next(e)

###
bnea_login
###
router.post "/session/bnea_login", (req, res, next) ->
	result = t.validate(req.body, validators.loginInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email?.toLowerCase()

	return logUserInByBnea(email, password, req.ip)
	.then (data) ->
		return res.status(200).json(data)
	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		# TODO SPECIAL ACTION REQUIRED HERE
		# bnea login may have been valid but the user does not exist in our system yet
		# GENERATE PASSWORD
		# CREATE NEW DUELYST USER
		# LINK ACCOUNTS
		# ALLOW LOGIN => ... ?
		# generate 16-character password automatically
		if e.bneaLoginData && e.bneaValidatedTokenData
			userId = null
			bneaId = e.bneaValidatedTokenData.id
			bneaLoginData = e.bneaLoginData

			return UsersModule.createBneaUser(email, null)
			.then (newUserId) ->
				userId = newUserId
				return UsersModule.associateBneaId({userId: userId, bneaId: bneaId})
			.then () ->
				return logUserIn(userId)
			.then (loginData) ->
				# TODO: stick a special flag on data here that it is a new user // no username?
				data = {
					token: loginData.token,
					analytics_data: loginData.analytics_data,
					bnea_token: bneaLoginData.access_token,
					bnea_refresh: bneaLoginData.refresh_token,
					bnea_id: bneaId
				}
				return res.status(201).json(data)
		else
			return res.status(404).json({})
	.catch Errors.AlreadyExistsError, (e) -> # Specific error if the email/user already exists
		Logger.module("BNEA").error "can not register because email already exists".red
		return res.status(400).json(e)
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA").log "BNEA Login - ERROR /bnea_login"
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

###
Steam bnea_login
Creates a link between Steam, BNEA, and Duelyst account
Should only be called once on client on a first time login/linking
###
router.post "/session/steam_bnea_associate", (req, res, next) ->
	result = t.validate(req.body, validators.loginInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email?.toLowerCase()
	# TODO: update input type
	steamTicket = req.body.steam_ticket
	birthdate_year = req.body.birthdate_year
	birthdate_month = req.body.birthdate_month
	birthdate_day = req.body.birthdate_day
	type = req.body.type

	is_subscribed = req.body.is_subscribed || false
	subscriptions = [{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.subscriptionId'),
		"subscription_name": config.get('bnea.subscriptionName'),
	},{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.duelystSubscriptionId'),
		"subscription_name": config.get('bnea.duelystSubscriptionName'),
	}]

	# Attempt to login via the Steam ticket
	return Steam.authenticateUserTicket(steamTicket)
	.bind {}
	.then (steamId) ->
		@steamId = steamId
		return Promise.all([
			UsersModule.userIdForSteamId(steamId),
			UsersModule.userIdForEmail(email)
		])
	.spread (idForSteam, idForEmail) ->
		# since Steam/Duelyst account already exists
		# they need to perform account Duelyst/Bnea linking not a login
		if idForSteam
			throw new Errors.BadRequestError('Duelyst/Steam account already linked')
		if idForEmail && type == 'register'
			throw new Errors.BadRequestError('Email already registered with Duelyst')

		# we either need to link or create a new account
		if type == 'login'
			return bnea.steamLink({
				steam_appid: parseInt(config.get('steam.appId')),
				steam_id: @steamId,
				steam_session_ticket: steamTicket,
				email: email,
				password: password
			}, req.ip)
		else if type == 'register'
			return bnea.steamRegister({
				steam_appid: parseInt(config.get('steam.appId')),
				steam_id: @steamId,
				steam_session_ticket: steamTicket,
				email: email,
				password: password,
				birthdate_year: birthdate_year,
				birthdate_month: birthdate_month,
				birthdate_day: birthdate_day,
				subscriptions: subscriptions
			}, req.ip)
	.then (res) ->
		if res.status == 200 && res.body && res.body.status == 'success'
			return res.body.data
		else
			# TODO: better handle of possible error here
			throw new Error('BNEA Steam linking failed')
	.then (bneaLoginData) ->
		@bneaLoginData = bneaLoginData
		return bnea.getUserId(bneaLoginData.access_token, req.ip)
	.then (bneaId) ->
		@bneaId = bneaId
		return UsersModule.userIdForBneaId(bneaId)
	.then (id) ->
		# Bnea ID already linked Duelyst account (would only happen on a login)
		# Just ensure Steam is linked and log them in
		if id
			return UsersModule.associateSteamId(id, @steamId)
			.bind(@)
			.then () ->
				return logUserIn(id)
			.then (loginData) ->
				data = {
					token: loginData.token,
					analytics_data: loginData.analytics_data,
					bnea_token: @bneaLoginData.access_token,
					bnea_refresh: @bneaLoginData.refresh_token,
					bnea_id: @bneaId
				}
				return res.status(200).json(data)
		# Otherwise it is a new ID without an associated Duelyst user, make a new one
		else
			return UsersModule.createBneaUser(email, null)
			.bind(@)
			.then (userId) ->
				@userId = userId
				return Promise.all([
					UsersModule.associateBneaId({userId: userId, bneaId: @bneaId})
					UsersModule.associateSteamId(userId, @steamId)
				])
			.then () ->
				return logUserIn(@userId)
			.then (loginData) ->
				data = {
					token: loginData.token,
					analytics_data: loginData.analytics_data,
					bnea_token: @bneaLoginData.access_token,
					bnea_refresh: @bneaLoginData.refresh_token,
					bnea_id: @bneaId
				}
				return res.status(201).json(data)
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module('BNEA').log('ERROR POST /steam_bnea_associate')
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

###
Deletes link between Steam <> Duelyst, Steam <> Bnea, Duelyst <> Bnea
###
router.delete "/session/steam_bnea_associate", isSignedIn, (req, res, next) ->
	id = req.user.d.id
	steamTicket = req.body.steam_ticket
	bneaToken = req.body.bnea_token

	return Promise.all([
		bnea.getUserId(bneaToken, req.ip),
		Steam.authenticateUserTicket(steamTicket)
	])
	.spread (bneaId, steamId) ->
		return Promise.all([
			UsersModule.disassociateBneaId(id),
			UsersModule.disassociateSteamId(id, steamId),
			bnea.steamUnlink(bneaToken, {account_id: parseInt(bneaId), steam_id: steamId}, req.ip)
		])
	.then (data) ->
		return res.status(200).json({})
	.catch (e) ->
		# Steam account not linked on BNEA end so just send success
		if e.status == 400 && e.code = 100804
			return res.status(200).json({})
		e.status = e.status || 500
		e.stack = undefined
		Logger.module('BNEA').log('ERROR DELETE /steam_bnea_associate')
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

###
POST handler for session login with steam ticket
No email/username/password are provided just ticket
###
router.post "/session/steam_login_bnea", (req, res, next) ->
	result = t.validate(req.body, validators.loginSteamInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	steamTicket = result.value.steam_ticket
	steamFriends = result.value.steam_friends || []

	Steam.authenticateUserTicket(steamTicket)
	.bind {}
	.then (steamId) ->
		@steamId = steamId
		return Promise.all([
			UsersModule.userIdForSteamId(steamId),
			loginBneaBySteam(steamId, steamTicket, req.ip)
		])
	.spread (id, bneaLoginData) ->
		@id = id
		@bneaLoginData = bneaLoginData
		if !id
			throw new Errors.NotFoundError()
		else
			return logUserIn(@id)
	.then (data) ->
		@loginData = data
		return UsersModule.createSteamFriendsSyncJob(@id, steamFriends)
	.then () ->
		# We have a linked Duelyst account and BNEA login data (by Steam)
		# login with merged tokens
		if @loginData.bnea_id != null && @bneaLoginData != null
			Logger.module('BNEA-STEAM').log('Login - Duelyst <> Steam <> BNEA login success')
			@loginData.bnea_token = @bneaLoginData.bneaLogin.access_token
			@loginData.bnea_refresh = @bneaLoginData.bneaLogin.refresh_token
			return res.status(200).json(@loginData)
		# We have a linked Duelyst account and no BNEA login data (none found by Steam)
		# bnea id exists but no steam/bnea link exists
		# 404 with bnea_id != null, kick them to bnea_steam_linking view
		else if @loginData.bnea_id != null && @bneaLoginData == null
			Logger.module('BNEA-STEAM').log('Login - Duelyst <> Steam exists, no BNEA <> Steam link')
			Logger.module('BNEA-STEAM').log('Login => Show prepopulated BNEA login to link to Steam')
			return res.status(404).json(@loginData)
		# We have a unlinked Duelyst account and no BNEA login data (none found by Steam)
		# Send 404 with a partial token, show already logged in linking screen
		else if @loginData.bnea_id == null && @bneaLoginData == null
			Logger.module('BNEA-STEAM').log('Login - Duelyst <> Steam exists, no Duelyst <> BNEA link')
			Logger.module('BNEA-STEAM').log('Login => Show account linking')
			return res.status(404).json(@loginData)
		# We have a unlinked Duelyst account and BNEA login data (by Steam)
		# automatically associate accounts
		# respond back with 200 status with full token with just_linked flag, triggering login
		# just_linked flag triggers bnea_done screen
		else if @loginData.bnea_id == null && @bneaLoginData != null
			Logger.module('BNEA-STEAM').log('Login - Duelyst <> Steam links exists for both, no Duelyst <> BNEA link')
			Logger.module('BNEA-STEAM').log('Login => Show bnea_done screen')
			return bnea.getUserId(@bneaLoginData.bneaLogin.access_token, req.ip)
			.then (bneaId) =>
				return UsersModule.associateBneaId({userId: @id, bneaId: bneaId})
			.then () =>
				@loginData.bnea_just_linked = true
				@loginData.bnea_token = @bneaLoginData.bneaLogin.access_token
				@loginData.bnea_refresh = @bneaLoginData.bneaLogin.refresh_token
				return res.status(200).json(@loginData)
		# This shouldn't happen...
		else
			return res.status(500).json({})	
	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	# UnauthorizedError occurs if Steam ticket was invalid (Steam not logged in)
	.catch Errors.UnauthorizedError, (e) ->
		return res.status(401).json({})
	# Ticket may have been valid but the user does not exist in our system yet
	.catch Errors.NotFoundError, (e) ->
		# Duelyst user does not exist, but the BNEA user may exist so we either need to show
		# a new user screen login/register screen or skip them to username creation
		if @bneaLoginData == null
			# 404 with empty object, no user at all
			Logger.module('BNEA-STEAM').log('Login - No Duelyst or BNEA user found by Steam ticket')
			Logger.module('BNEA-STEAM').log('Login => Show welcome screen')
			return res.status(404).json({})
		else
			return UsersModule.userIdForEmail(@bneaLoginData.account.email)
			.then (id) =>
				if id
					# we show an error dialog on the client and ask them to contact support
					# 409 conflict with empty object
					return res.status(409).json({})
				else
					# create new user here (email may exist already) and kick them to select username
					# associate in the background
					Logger.module('BNEA-STEAM').log('Login - BNEA <> Steam user found, creating new Duelyst user')
					Logger.module('BNEA-STEAM').log('Login => Show select username screen')
					bneaId = @bneaLoginData.token.id
					bneaEmail = @bneaLoginData.account.email
					bneaToken = @bneaLoginData.bneaLogin.access_token
					bneaRefresh = @bneaLoginData.bneaLogin.refresh_token
					steamId = @steamId
					userId = null
					return UsersModule.createBneaUser(bneaEmail, null)
					.then (newUserId) ->
						userId = newUserId
						return Promise.all([
							UsersModule.associateBneaId({userId: userId, bneaId: bneaId}),
							UsersModule.associateSteamId(userId, steamId)
						])
					.then () ->
						return logUserIn(userId)
					.then (loginData) ->
						data = {
							token: loginData.token,
							analytics_data: loginData.analytics_data,
							bnea_token: bneaToken,
							bnea_refresh: bneaRefresh,
							bnea_id: bneaId
						}
						return res.status(201).json(data)
	# We may end up 500ing back to user if Steam API fails (ie non-200 res from Steam)
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA-STEAM").log "Login - ERROR /steam_login_bnea"
		Logger.module("BNEA-STEAM").log(e)
		return res.status(e.status).json(e)

###
POST handler for registration
Register new users
###
router.post "/session/register", (req, res, next) ->
	result = t.validate(req.body, validators.signupInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email.toLowerCase()
	username = result.value.username.toLowerCase()
	inviteCode = result.value.keycode?.trim()
	referralCode = result.value.referral_code?.trim()
	friendReferralCode = result.value.friend_referral_code?.trim()
	campaignData = result.value.campaign_data
	captcha = result.value.captcha
	registrationSource = if result.value.is_desktop then 'desktop' else 'web'

	UsersModule.isValidInviteCode(inviteCode)
	.bind {}
	.then (inviteCodeData) -> # captcha verification
		if captcha? and config.get('recaptcha.secret')
			return Promise.resolve(
				fetch "https://www.google.com/recaptcha/api/siteverify",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/x-www-form-urlencoded'
					body: formurlencoded({
						secret: config.get('recaptcha.secret')
						response: captcha
					})
			)
			.bind(@)
			.timeout(10000)
			.then (res) ->
				if res.ok
					return res.json()
				else
					throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
			.then (body) ->
				return Promise.resolve(body.success)
		else if config.get('recaptcha.enabled') == false
			return true
		else
			return false
	.then (isCaptchaVerified) ->
		if not isCaptchaVerified
			throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
		return UsersModule.createNewUser(email,username,password,inviteCode,referralCode,campaignData,registrationSource)
	.then (userId) ->
		# if we have a friend referral code just fire off async the job to link these two together
		if friendReferralCode?
			UsersModule.userIdForUsername(friendReferralCode)
			.then (referrerId)->
				if not referrerId?
					throw new Errors.NotFoundError("Referrer not found by username.")
				return ReferralsModule.markUserAsReferredByFriend(userId,referrerId)
			.catch (err)->
				Logger.module("Session").error "failed to mark #{userId} as referred by #{friendReferralCode}. error:#{err.message}".red
		# notify twitch alerts of conversion
		if campaignData?["campaign_id"] and campaignData?["campaign_medium"] == "openpromotion"
			Logger.module("Session").debug "twitch-alerts conversion. pinging: https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=...&campaign_id=#{campaignData["campaign_id"]}"
			Promise.resolve(fetch("https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=2d82e8c0cf17467490467b0c77c6c08e&campaign_id=#{campaignData["campaign_id"]}"))
			.timeout(10000)
			.then (res) ->
				return res.json()
			.then (body) ->
				Logger.module("Session").debug "twitch-alerts response: ",body
			.catch (e) ->
				Logger.module("Session").error "twitch-alerts error processing: #{e.message}"
		# respond back to client
		return res.status(200).json({})
	.catch Errors.InvalidInviteCodeError, (e) ->	# Specific error if the invite code is invalid
		Logger.module("Session").error "can not register because invite code #{inviteCode?.yellow} is invalid".red
		return res.status(400).json(e)
	.catch Errors.InvalidReferralCodeError, (e) ->	# Specific error if the invite code is invalid
		Logger.module("Session").error "can not register because referral code #{referralCode?.yellow} is invalid".red
		return res.status(400).json(e)
	.catch Errors.AlreadyExistsError, (e) ->	# Specific error if the email/user already exists
		Logger.module("Session").error "can not register because username #{username?.blue} or email already exists".red
		return res.status(401).json(e)
	.catch Errors.UnverifiedCaptchaError, (e) ->	# Specific error if the captcha fails
		Logger.module("Session").error "can not register because captcha #{captcha} input is invalid".red
		return res.status(401).json(e)
	.catch (e) -> next(e)

###
POST handler for BNEA registration
###
router.post "/session/bnea_register", (req, res, next) ->
	result = t.validate(req.body, validators.bneaSignupInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email.toLowerCase()
	birthdate_year = result.value.birthdate_year
	birthdate_month = result.value.birthdate_month
	birthdate_day = result.value.birthdate_day
	source = result.value.source
	username = result.value.username?.toLowerCase()
	inviteCode = 'kumite14'
	referralCode = result.value.referral_code?.trim()
	friendReferralCode = result.value.friend_referral_code?.trim()
	campaignData = result.value.campaign_data
	captcha = result.value.captcha
	registrationSource = if result.value.is_desktop then 'desktop' else 'web'

	is_subscribed = req.body.is_subscribed || false
	subscriptions = [{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.subscriptionId'),
		"subscription_name": config.get('bnea.subscriptionName'),
	},{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.duelystSubscriptionId'),
		"subscription_name": config.get('bnea.duelystSubscriptionName'),
	}]

	UsersModule.isValidInviteCode(inviteCode)
	.bind {}
	.then (inviteCodeData) -> # captcha verification
		if captcha? and config.get('recaptcha.secret')
			return Promise.resolve(
				fetch "https://www.google.com/recaptcha/api/siteverify",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/x-www-form-urlencoded'
					body: formurlencoded({
						secret: config.get('recaptcha.secret')
						response: captcha
					})
			)
			.bind(@)
			.timeout(10000)
			.then (res) ->
				if res.ok
					return res.json()
				else
					throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
			.then (body) ->
				return Promise.resolve(body.success)
		else if config.get('recaptcha.enabled') == false
			return true
		else
			return false
	.then (isCaptchaVerified) ->
		if not isCaptchaVerified
			throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
		# TODO: we should actually randomly generate a password here
		return UsersModule.createBneaUser(email,username,password,inviteCode,referralCode,campaignData,registrationSource)
	.then (userId) ->
		# if we have a friend referral code just fire off async the job to link these two together
		if friendReferralCode?
			UsersModule.userIdForUsername(friendReferralCode)
			.then (referrerId)->
				if not referrerId?
					throw new Errors.NotFoundError("Referrer not found by username.")
				return ReferralsModule.markUserAsReferredByFriend(userId,referrerId)
			.catch (err)->
				Logger.module("Session").error "failed to mark #{userId} as referred by #{friendReferralCode}. error:#{err.message}".red
		# notify twitch alerts of conversion
		if campaignData?["campaign_id"] and campaignData?["campaign_medium"] == "openpromotion"
			Logger.module("Session").debug "twitch-alerts conversion. pinging: https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=...&campaign_id=#{campaignData["campaign_id"]}"
			Promise.resolve(fetch("https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=2d82e8c0cf17467490467b0c77c6c08e&campaign_id=#{campaignData["campaign_id"]}"))
			.timeout(10000)
			.then (res) ->
				return res.json()
			.then (body) ->
				Logger.module("Session").debug "twitch-alerts response: ",body
			.catch (e) ->
				Logger.module("Session").error "twitch-alerts error processing: #{e.message}"
		return createAndLoginBneaUser({
			email, 
			password, 
			birthdate_year, 
			birthdate_month, 
			birthdate_day, 
			subscriptions,
			source
		}, req.ip)
		.then (data) ->
			return UsersModule.associateBneaId({userId: userId, bneaId: data.token.id})
		.then () ->
			return res.status(200).json({})
		.catch (e) ->
			# We still may end up in partial registration state here
			# - if BNEA login fails after registration
			# - if BNEA ticket validation fails after registration
			# - if associateBneaId account linking fails
			return UsersModule.deleteNewUser(userId)
			.then () ->
				throw e
	.catch Errors.InvalidInviteCodeError, (e) ->	# Specific error if the invite code is invalid
		Logger.module("Session").error "can not register because invite code #{inviteCode?.yellow} is invalid".red
		return res.status(400).json(e)
	.catch Errors.InvalidReferralCodeError, (e) ->	# Specific error if the invite code is invalid
		Logger.module("Session").error "can not register because referral code #{referralCode?.yellow} is invalid".red
		return res.status(400).json(e)
	.catch Errors.AlreadyExistsError, (e) ->	# Specific error if the email/user already exists
		Logger.module("Session").error "can not register because username #{username?.blue} or email already exists".red
		return res.status(400).json(e)
	.catch Errors.UnverifiedCaptchaError, (e) ->	# Specific error if the captcha fails
		Logger.module("Session").error "can not register because captcha #{captcha} input is invalid".red
		return res.status(401).json(e)
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA").log "BNEA Register - ERROR /bnea_register"
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

###
POST handler for checking availability of email
###
router.post "/session/email_available", (req, res, next) ->
	result = t.validate(req.body.email, types.Email)
	if not result.isValid()
		return res.status(400).json(result.errors)

	email = result.value.toLowerCase()

	UsersModule.userIdForEmail(email)
	.then (id) ->
		if id
			throw new Errors.AlreadyExistsError("Email already exists")
		else
			return res.status(200).json({})
	.catch Errors.AlreadyExistsError, (e) ->
		return res.status(401).json(e)
	.catch (e) -> next(e)

###
POST handler for checking availability of username
###
router.post "/session/username_available", (req, res, next) ->
	result = t.validate(req.body.username, types.Username)
	if not result.isValid()
		return res.status(400).json(result.errors)

	username = result.value.toLowerCase()

	UsersModule.userIdForUsername(username)
	.then (id) ->
		if id
			throw new Errors.AlreadyExistsError("Username already exists")
		else
			return res.status(200).json({})
	.catch Errors.AlreadyExistsError, (e) ->
		return res.status(401).json(e)
	.catch (e) -> next(e)

###
POST handler for changing a username
###
router.post "/session/change_username", isSignedIn, (req, res, next) ->
	user_id = req.user.d.id
	result = t.validate(req.body.new_username, types.Username)
	if not result.isValid()
		return res.status(400).json(result.errors)

	new_username = result.value.toLowerCase()

	UsersModule.changeUsername(user_id,new_username)
	.then () ->
		return res.status(200).json({})
	.catch Errors.AlreadyExistsError, (e) ->	# Specific error if the username already exists
		Logger.module("Session").error "can not change username to #{new_username.blue} as it already exists".red
		return res.status(400).json(e)
	.catch Errors.InsufficientFundsError, (e) ->
		Logger.module("Session").error "can not change username to #{new_username.blue} due to insufficient funds".red
		return res.status(400).json(e)
	.catch (e) ->
		next(e)

###
POST handler for changing a password
###
router.post "/session/change_password", isSignedIn, (req, res, next) ->
	user_id = req.user.d.id
	result = t.validate(req.body, validators.changePasswordInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	current_password = result.value.current_password
	new_password = result.value.new_password

	UsersModule.changePassword(user_id, current_password, new_password)
	.then ()->
		return res.status(200).json({message: 'OK - password changed'})
	.catch Errors.BadPasswordError, (e) ->
		return res.status(401).json({})
	.catch (e) -> next(e)

###
GET handler for session logout
Invalidates current session used by user
###
router.get "/session/logout", isSignedIn, (req, res) ->
	return res.status(200).json({authenticated: false})

###
REFERRAL CODES routes
###
router.use '/session/referral_codes/:code', (req, res, next) ->
	result = t.validate(req.params.code, types.ReferralCode)
	if not result.isValid()
		return res.status(400).json(result.errors)

	code = result.value.trim()

	UsersModule.getValidReferralCode(code)
	.then (row) ->
		res.status(200).json(DataAccessHelpers.restifyData(row))
	.catch Errors.InvalidReferralCodeError, (e)->
		res.status(404).json({})
	.catch (e) -> next(e)

router.get '/session/discourse/sso', (req, res, next)->

	Logger.module("API").debug "validating SSO payload: #{req.query.sso} with sig #{req.query.sig}"

	if discourseSSO.validate(req.query.sso, req.query.sig)
		nonce = discourseSSO.getNonce(req.query.sso)
		return res.status(200).json({
			nonce: nonce
		})
	else
		return res.status(401).json({message: 'Invalid signature'})

router.post '/session/discourse/sso_legacy', (req, res, next)->

	Logger.module("API").debug "SSO request body: ",req.body

	result = t.validate(req.body, validators.discourseSsoInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email?.toLowerCase()
	username = result.value.username?.toLowerCase()

	getUserIdAsync = if username then UsersModule.userIdForUsername(username) else UsersModule.userIdForEmail(email)

	getUserIdAsync
	.bind {}
	.then (id) -> # Step 2 : check if user exists
		if !id
			throw new Errors.NotFoundError()
		@id = id
		return UsersModule.userDataForId(id)
	.then (data) -> # check password valid
		@.userRow = data
		return hashHelpers.comparePassword(password, data.password)
	.then (match) ->
		if (!match)
			throw new Errors.BadPasswordError()
		else
			if @.userRow.is_suspended
				throw new Errors.AccountDisabled("This account has been suspended. Reason: #{@.userRow.suspended_memo}")
			if not @.userRow.email_verified_at
				throw new Errors.UnverifiedEmailError("You must verify ownership of the email on this account. We've sent you an email with instructions.")
			userparams =
				"nonce": req.body.nonce,
				"external_id": @.userRow.id,
				"email": @.userRow.email,
				"username": @.userRow.username,
				# "name": "some real name"

			Logger.module("API").debug "SSO userparams: ",userparams

			q = discourseSSO.buildLoginString(userparams)
			res.status(200).json({redirect_url:"#{config.get('discourse.forumUrl')}?#{q}"})

	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch Errors.BadPasswordError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch Errors.UnverifiedEmailError, (e) ->
		verifyToken = uuid.v4()
		return knex('email_verify_tokens').where('user_id',@.userRow.id).update(
			verify_token:verifyToken
			created_at:moment().utc().toDate()
		)
		.bind @
		.then ()->
			mail.sendEmailVerificationLinkAsync(@.userRow.username, @.userRow.email, verifyToken)
			return res.status(400).json({message: e.message, type:"UnverifiedEmailError"})
	.catch (e) -> next(e)

router.post '/session/discourse/sso', (req, res, next)->

	Logger.module("API").debug "SSO request body: ",req.body

	result = t.validate(req.body, validators.discourseSsoInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	password = result.value.password
	email = result.value.email?.toLowerCase()

	return bnea.login({email, password})
	.bind {}
	.then (res) ->
		@bneaLoginData = res.body.data
		return bnea.validateToken(@bneaLoginData.access_token)
	.then (res) ->
		@validatedTokenData = res.body.data
		return UsersModule.userDataForBneaId(@validatedTokenData.id)
	.then (userRow) ->
		@.userRow = userRow
		userparams =
			"nonce": req.body.nonce,
			"external_id": @.userRow.id,
			"email": @.userRow.email,
			"username": @.userRow.username
		Logger.module("API").debug "SSO userparams: ",userparams
		q = discourseSSO.buildLoginString(userparams)
		res.status(200).json({redirect_url:"#{config.get('discourse.forumUrl')}?#{q}"})
	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		return res.status(404).json({})
	.catch (e) ->
		next(e)

###
BNEA Link
###
router.get "/session/bnea_link", isSignedIn, (req, res, next) ->
	id = req.user.d.id
	return UsersModule.userDataForId(id)
	.then (data) ->
		if !data.bnea_id
			throw new Errors.NotFoundError()
		else
			return res.status(200).json({bnea_id: data.bnea_id, bnea_associated_at: data.bnea_associated_at})
	.catch (e) ->
		next(e)

router.delete "/session/bnea_link", isSignedIn, (req, res, next) ->
	id = req.user.d.id
	return UsersModule.userDataForId(id)
	.then (data) ->
		if !data.bnea_id
			throw new Errors.NotFoundError()
		else
			return UsersModule.disassociateBneaId(id)
	.catch (e) ->
		next(e)

router.post "/session/bnea_link", isSignedIn, (req, res, next) ->
	result = t.validate(req.body, validators.linkBneaInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	id = req.user.d.id
	password = result.value.password
	email = result.value.email?.toLowerCase()
	birthdate_year = result.value.birthdate_year
	birthdate_month = result.value.birthdate_month
	birthdate_day = result.value.birthdate_day
	source = result.value.source
	type = result.value.type
	
	is_subscribed = req.body.is_subscribed || false
	subscriptions = [{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.subscriptionId'),
		"subscription_name": config.get('bnea.subscriptionName'),
	},{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.duelystSubscriptionId'),
		"subscription_name": config.get('bnea.duelystSubscriptionName'),
	}]

	# get user data to check for existing link
	# if type = 'login' then login and associate
	# if type = 'register' then create new account, login, associate
	Logger.module("BNEA").log "Linking - u:#{id}..."
	return Promise.all([
		UsersModule.userDataForId(id),
		UsersModule.userIdForEmail(email)
	])
	.bind {}
	.spread (userDataForId, userIdForEmail) ->
		# user not found, this shouldn't happen since the user is logged in...
		if !userDataForId
			throw new Errors.NotFoundError()

		# User already has a bnea_id associated
		# Should not occur as the user would have been prevented from attempting to link already
		if userDataForId.bnea_id
			throw new Errors.BadRequestError('Duelyst account is already linked.')

		# The BNEA email being used for linking already has a different account associated
		if userIdForEmail != id
			throw new Errors.BadRequestError('BNEA account is already associated with a Duelyst account.')

		if type == 'login'
			return loginBnea({email: email, password: password}, req.ip)
			.bind @
			.then (bneaLoginData)->
				@bneaLoginData = bneaLoginData
				return UsersModule.associateBneaId({userId: id, bneaId: bneaLoginData.token.id, bneaEmail: email})
			.then () ->
				return Promise.resolve(true)

		else if type == 'register'
			return createAndLoginBneaUser({
				email, 
				password, 
				birthdate_year, 
				birthdate_month, 
				birthdate_day, 
				subscriptions,
				source
			}, req.ip)
			.bind @
			.then (bneaLoginData) ->
				@bneaLoginData = bneaLoginData
				return UsersModule.associateBneaId({userId: id, bneaId: bneaLoginData.token.id, bneaEmail: email})
			.then () ->
				return Promise.resolve(true)
	.then (wasLinked) ->
		Logger.module("BNEA").log "Linking - u:#{id} was linked -> #{wasLinked}"
		if wasLinked
			return bnea.migrationNotify(@bneaLoginData.bneaLogin.access_token, @bneaLoginData.token.id)
	.then () ->
		Logger.module("BNEA").log "Linking - u:#{id} COMPLETE"
		return res.status(200).json({})
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA").log "Linking - u:#{id} ERROR /bnea_link"
		Logger.module("BNEA").log(e)
		return res.status(e.status).json(e)

router.patch "/session/bnea_link", isSignedIn, (req, res, next) ->
	# result = t.validate(req.body, validators.linkBneaInput)
	# if not result.isValid()
	# 	return res.status(400).json(result.errors)

	currentId = req.user.d.id
	password = req.body.password
	email = req.body.email?.toLowerCase()
	username = req.body.username?.toLowerCase()
	
	getUserIdAsync = if username then UsersModule.userIdForUsername(username) else UsersModule.userIdForEmail(email)
	
	getUserIdAsync
	.bind {}
	.then (existingId) ->
		if !existingId
			throw new Errors.NotFoundError()

		@existingId = existingId
		return UsersModule.userDataForId(existingId)
	.then (existingUserData) ->
		@existingUserData = existingUserData
		return hashHelpers.comparePassword(password, existingUserData.password)
	.then (match) ->
		if !match
			throw new Errors.BadPasswordError()

		if @existingUserData.is_suspended
			throw new Errors.AccountDisabled("This account has been suspended. Reason: #{@existingUserData.suspended_memo}")

		return UsersModule.userDataForId(currentId)
	.then (currentUserData) ->
		@currentUserData = currentUserData
		@bneaId = @currentUserData.bnea_id
		if !@bneaId
			throw new Errors.BadRequestError("No BNEA account linked with currently logged in account.")
		
		if @existingUserData.bnea_id && @existingUserData.bnea_id != @bneaId
			throw new Errors.BadRequestError("This Duelyst account is already linked to a BNEA account.")
		
		return UsersModule.disassociateBneaId(currentId)
	.then () ->
		return UsersModule.associateBneaId({userId: @existingId, bneaId: @bneaId})
	.then () ->
		return res.status(200).json({})
	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch Errors.BadPasswordError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		return res.status(e.status).json(e)

router.patch "/session/steam_bnea_link", isSignedIn, (req, res, next) ->
	# result = t.validate(req.body, validators.linkBneaInput)
	# if not result.isValid()
	# 	return res.status(400).json(result.errors)

	currentId = req.user.d.id
	password = req.body.password
	email = req.body.email?.toLowerCase()
	username = req.body.username?.toLowerCase()
	steamTicket = req.body.steam_ticket || null

	getUserIdAsync = if username then UsersModule.userIdForUsername(username) else UsersModule.userIdForEmail(email)
	
	getUserIdAsync
	.bind {}
	.then (existingId) ->
		if !existingId
			throw new Errors.NotFoundError()

		@existingId = existingId
		return Promise.all([
			UsersModule.userDataForId(existingId),
			Steam.authenticateUserTicket(steamTicket)
		])
	.spread (existingUserData, steamId) ->
		@existingUserData = existingUserData
		@steamId = steamId
		return hashHelpers.comparePassword(password, existingUserData.password)
	.then (match) ->
		if !match
			throw new Errors.BadPasswordError()

		if @existingUserData.is_suspended
			throw new Errors.AccountDisabled("This account has been suspended. Reason: #{@existingUserData.suspended_memo}")

		return UsersModule.userDataForId(currentId)
	.then (currentUserData) ->
		@currentUserData = currentUserData
		@bneaId = @currentUserData.bnea_id

		if !@bneaId
			throw new Errors.BadRequestError("No BNEA account linked with currently logged in account.")

		if @existingUserData.bnea_id && @existingUserData.bnea_id != @bneaId
			throw new Errors.BadRequestError("This Duelyst account is already linked to a BNEA account.")
		
		if @existingUserData.steam_id && @existingUserData.steam_id != @steamId
			throw new Errors.BadRequestError("This Duelyst account is already linked to a Steam account.")
		
		return Promise.all([
			UsersModule.disassociateBneaId(currentId),
			UsersModule.disassociateSteamId(currentId),
		])
	.then () ->
		return Promise.all([
			UsersModule.associateBneaId({userId: @existingId, bneaId: @bneaId}),
			UsersModule.associateSteamId(@existingId, @steamId)
		])
	.then () ->
		return res.status(200).json({})
	.catch Errors.AccountDisabled, (e) ->
		return res.status(400).json({message: e.message})
	.catch Errors.NotFoundError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch Errors.BadPasswordError, (e) ->
		return res.status(401).json({message: 'Invalid Email or Password'})
	.catch (e) -> 
		e.status = e.status || 500
		e.stack = undefined
		return res.status(e.status).json(e)

router.post "/session/steam_bnea_link", isSignedIn, (req, res, next) ->
	result = t.validate(req.body, validators.linkBneaInput)
	if not result.isValid()
		return res.status(400).json(result.errors)

	id = req.user.d.id
	password = result.value.password
	email = result.value.email?.toLowerCase()
	birthdate_year = result.value.birthdate_year
	birthdate_month = result.value.birthdate_month
	birthdate_day = result.value.birthdate_day
	type = result.value.type
	steamTicket = req.body.steam_ticket || null

	is_subscribed = req.body.is_subscribed || false
	subscriptions = [{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.subscriptionId'),
		"subscription_name": config.get('bnea.subscriptionName'),
	},{
		"is_subscribed": is_subscribed,
		"subscription_id": config.get('bnea.duelystSubscriptionId'),
		"subscription_name": config.get('bnea.duelystSubscriptionName'),
	}]

	# get user data to check for existing link
	# if type = 'login' then login and associate
	# if type = 'register' then create new account, login, associate
	Logger.module("BNEA").log "Linking via Steam - u:#{id} /steam_bnea_link"
	return Promise.all([
		UsersModule.userDataForId(id),
		Steam.authenticateUserTicket(steamTicket)
	])
	.bind {}
	.spread (userData, steamId) ->
		@userData = userData
		@steamId = steamId
		# user not found, this shouldn't happen since the user is logged in...
		if !userData
			throw new Errors.NotFoundError()

		# if the account is already associated with a different Steam ID
		if userData.steam_id != null && userData.steam_id != steamId
			Logger.module("BNEA").log "Linking via Steam - u:#{id} failed -> Duelyst account was linked to different Steam account"
			throw new Errors.BadRequestError('Duelyst account is already linked to different Steam account.')

		# even though it may already exist, we ensure the link between Duelyst and Steam
		return UsersModule.associateSteamId(id, steamId)
	.then () ->
		# User already has a bnea_id associated
		# Should not occur as the user would have been prevented from attempting to link already
		if @userData.bnea_id
			throw new Errors.BadRequestError('Duelyst account is already linked.')

		if type == 'login'
			Logger.module("BNEA").log "Linking via Steam - u:#{id} -> attempting to login existing BNEA account"
			return loginBnea({email: email, password: password}, req.ip)
			.bind @
			.then (bneaLoginData) =>
				@bneaLoginData = bneaLoginData
				return Promise.all([
					UsersModule.associateBneaId({userId: id, bneaId: bneaLoginData.token.id, bneaEmail: email}),
					bnea.steamLink({
						steam_appid: parseInt(config.get('steam.appId')),
						steam_id: @steamId,
						steam_session_ticket: steamTicket,
						email: email,
						password: password
					}, req.ip)
				])
			.then () ->
				return Promise.resolve(true)

		else if type == 'register'
			Logger.module("BNEA").log "Linking via Steam - u:#{id} -> attempting to register new BNEA account"
			return createAndLoginBneaUser({
				email, 
				password, 
				birthdate_year, 
				birthdate_month, 
				birthdate_day, 
				subscriptions,
				source: 'STEAM-DUEL-PC'
			}, req.ip)
			.bind @
			.then (bneaLoginData) =>
				@bneaLoginData = bneaLoginData
				return Promise.all([
					UsersModule.associateBneaId({userId: id, bneaId: bneaLoginData.token.id, bneaEmail: email})
					bnea.steamLink({
						steam_appid: parseInt(config.get('steam.appId')),
						steam_id: @steamId,
						steam_session_ticket: steamTicket,
						email: email,
						password: password
					}, req.ip)
				])
			.then () ->
				return Promise.resolve(true)
	.then (wasLinked) ->
		Logger.module("BNEA").log "Linking via Steam - u:#{id} was linked -> #{wasLinked}"
		if wasLinked
			return bnea.migrationNotify(@bneaLoginData.bneaLogin.access_token, @bneaLoginData.token.id)
	.then () ->
		Logger.module("BNEA").log "Linking via Steam - u:#{id} COMPLETE"
		return res.status(200).json({})
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA").log "Linking via Steam - u:#{id} ERROR /steam_bnea_link"
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

router.post "/session/bnea_steam_link", isSignedIn, (req, res, next) ->
	# result = t.validate(req.body, validators.linkBneaInput)
	# if not result.isValid()
	# 	return res.status(400).json(result.errors)

	id = req.user.d.id
	email = req.body.email.toLowerCase()
	password = req.body.password
	steamTicket = req.body.steam_ticket

	Logger.module("BNEA").log "Linking BNEA with Steam - u:#{id} /bnea_steam_link"

	# get user data to check for existing link
	return Steam.authenticateUserTicket(steamTicket)
	.bind {}
	.then (steamId) ->
		@steamId = steamId
		return UsersModule.userIdForSteamId(steamId)
	.then (id) ->
		# user not found, this shouldn't happen since the user is logged in already via Steam
		if !id
			throw new Errors.NotFoundError()
		return UsersModule.userDataForId(id)
	.then (data) ->
		# this is for an edge case only where BNEA <> Steam link does not exist
		if data.bnea_id == null
			Logger.module("BNEA").log "Linking BNEA with Steam - u:#{id} failed -> no bnea_id found"
			return new Errors.BadRequestError()
		else
			return bnea.login({email, password}, req.ip)
			.then (res) =>
				return bnea.getUserId(res.body.data.access_token, req.ip)
			.then (bneaId) =>
				if data.bnea_id != bneaId
					Logger.module("BNEA").log "Linking BNEA with Steam - u:#{id} failed -> Duelyst linked to different BNEA id already"
					throw new Errors.BadRequestError('Account is linked to different BNEA account already.')
				else
					return bnea.steamLink({
						steam_appid: parseInt(config.get('steam.appId')),
						steam_id: @steamId,
						steam_session_ticket: steamTicket,
						email: email,
						password: password
					}, req.ip)
			.then () ->
				Logger.module("BNEA").log "Linking BNEA with Steam - u:#{id} COMPLETE"
				return res.status(200).json({})
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("BNEA").log "Linking BNEA with Steam - u:#{id} ERROR /bnea_steam_link"
		Logger.module('BNEA').log(e)
		return res.status(e.status).json(e)

###
Kongregate Login / Silent Registration
###
router.post "/session/kongregate_login", (req, res, next) ->
	kongregateId = req.body.kongregate_id || null
	kongregateToken = req.body.kongregate_token || null
	if !kongregateId || !kongregateToken
		return res.status(400).json({})
	
	return bnea.kongregateChannel(kongregateId, kongregateToken)
	.bind {}
	.then (res) ->
		Logger.module('KONGREGATE').log "Account channeling complete"
		@bneaLoginData = res.body.data
		return bnea.getUserId(@bneaLoginData.access_token)
	.then (bneaId) ->
		@bneaId = bneaId
		return UsersModule.userIdForBneaId(@bneaId)
	.then (idForBneaId) ->
		# user found, load data
		if idForBneaId
			Logger.module('KONGREGATE').log "Existing user found, logging in"
			return logUserIn(idForBneaId)
		# user not found, must create new one
		else
			return UsersModule.createBneaUser()
			.bind @
			.then (userId) ->
				@userId = userId
				return Promise.all([
					UsersModule.associateBneaId({userId: @userId, bneaId: @bneaId}),
					UsersModule.associateKongregateId({userId: @userId, kongregateId: kongregateId}),
				])
			.then () ->
				Logger.module('KONGREGATE').log "New user created, logging in"
				return logUserIn(@userId)
	.then (data) ->
		Logger.module('KONGREGATE').log "Logged in #{@userId} by /kongregate_login"
		return res.status(200).json({
			token: data.token,
			bnea_token: @bneaLoginData.access_token,
			bnea_refresh: @bneaLoginData.refresh_token,
			bnea_id: @bneaId,
			analytics_data: data.analytics_data
		})
	.catch (e) ->
		e.status = e.status || 500
		e.stack = undefined
		Logger.module("KONGREGATE").log "ERROR /kongregate_login"
		Logger.module('KONGREGATE').log(e)
		return res.status(e.status).json(e)

module.exports = router