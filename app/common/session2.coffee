debug = require('debug')('session')
{EventEmitter} = require 'events'
Promise = require 'bluebird'
Firebase = require 'firebase'
fetch = require 'isomorphic-fetch'
moment = require 'moment'
bnea = require('server/lib/bnea')()
window.bnea = bnea
Storage = require('app/common/storage')
i18next = require('i18next')

class Session extends EventEmitter

	constructor: (options = {}) ->
		@url = process.env.API_URL || options.url || 'http://localhost:5000'
		@fbUrl = process.env.FIREBASE_URL || options.fbUrl || 'https://duelyst-development.firebaseio.com/'
		debug("constructor: #{@url} : #{@fbUrl}")
		# init props for reference
		@fbRef = null
		@token = null
		@expires = null
		@userId = null
		@username = null
		@analyticsData = null
		@justRegistered = null
		@steamTicket = null
		@bneaToken = null
		@bneaRefresh = null
		@bneaJustLinked = null
		@_cachedPremiumBalance = null
		return

	_checkResponse: (res) ->
		if res.ok
			debug("_checkResponse: #{res.status}")
			return res.json()
			.then (data) ->
				data.status = res.status
				return data
		else
			err = new Error(res.statusText)
			err.status = res.status
			if res.status == 400 || res.status == 401
				return res.json().then (data) =>
					err.innerMessage = if data.codeMessage then data.codeMessage else data.message
					debug("_checkResponse: #{res.status} : #{err.message} : #{err.innerMessage}")
					@emit 'error', err
					throw err
			else
				err.innerMessage = 'Please try again'
				debug("_checkResponse: #{res.status} : #{err.message}")
				@emit 'error', err
				throw err

	_networkError: (e) ->
		debug("_networkError: #{e.message}")
		throw new Error('Please try again')

	_authFirebase: (token) ->
		debug('authFirebase')
		return new Promise (resolve, reject) =>
			@fbRef = new Firebase(@fbUrl)
			@fbRef.authWithCustomToken token, (err, res) ->
				debug('authWithCustomToken')
				if err then return reject(err)
				resolve(res)

	_deauthFirebase: () ->
		debug('deauthFirebase')
		if @userId
			@fbRef
			.child("users")
			.child(@userId)
			.child("presence")
			.update({
				status: "offline"
				ended: Firebase.ServerValue.TIMESTAMP
			})
		@fbRef.unauth()

	_decodeFirebaseToken: (token) ->
		debug('_decodeFirebaseToken')
		@userId = token.auth.id
		@username = token.auth.username
		@expires = token.expires

	login: (usernameOrEmail, password, silent = false) ->
		debug("login: #{usernameOrEmail}")

		body = {}
		body.password = password
		if usernameOrEmail.indexOf('@') > 0
			body.email = usernameOrEmail
		else
			body.username = usernameOrEmail

		return Promise.resolve(
			fetch "#{@url}/session",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify(body)
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (res) =>
			@analyticsData = res.analytics_data
			@token = res.token
			@bneaAssociatedAt = res.bnea_associated_at
			return @_authFirebase(@token)
		.then (res) =>
			debug(res)
			@userId = res.auth.id
			@username = res.auth.username
			@expires = res.expires

			data = {token: @token, userId: @userId,analyticsData:@analyticsData, bneaAssociated: @bneaAssociatedAt}
			if !silent
				@emit 'login', data
			return data

	loginBnea: (usernameOrEmail, password, silent = false) ->
		debug("loginBnea: #{usernameOrEmail}")

		body = {}
		body.password = password
		if usernameOrEmail.indexOf('@') > 0
			body.email = usernameOrEmail
		else
			body.username = usernameOrEmail

		return Promise.resolve(
			fetch "#{@url}/session/bnea_login",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify(body)
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (res) =>
			@status = res.status
			@analyticsData = res.analytics_data
			@token = res.token
			@bneaToken = res.bnea_token
			@bneaRefresh = res.bnea_refresh
			return @_authFirebase(@token)
		.then (res) =>
			debug(res)
			@userId = res.auth.id
			@username = res.auth.username
			@expires = res.expires
			# Just fire request for balance without waiting
			@getBneaAccountBalance()
			data = {
				token: @token,
				bneaToken: @bneaToken,
				bneaRefresh: @bneaRefresh,
				userId: @userId,
				analyticsData: @analyticsData
			}
			if !silent
				@emit 'login', data
			return {@status, data}

	loginSteamBnea: (data, silent = false) ->
		debug("loginSteamBnea")
		return @getSteamAuthTicket()
		.bind(this)
		.then (ticket) =>
			@steamTicket = ticket
			data.steam_ticket = ticket
			return Promise.resolve(
				fetch "#{@url}/session/steam_bnea_associate",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/json'
					body: JSON.stringify(data)
			)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (res) =>
			@status = res.status
			@analyticsData = res.analytics_data
			@token = res.token
			@bneaToken = res.bnea_token
			@bneaRefresh = res.bnea_refresh
			return @_authFirebase(@token)
		.then (res) =>
			debug(res)
			@userId = res.auth.id
			@username = res.auth.username
			@expires = res.expires
			# Just fire request for balance without waiting
			@getBneaAccountBalance()
			data = {
				token: @token,
				bneaToken: @bneaToken,
				bneaRefresh: @bneaRefresh,
				userId: @userId,
				analyticsData: @analyticsData
				steamTicket: @steamTicket
			}
			if !silent
				@emit 'login', data
			return {@status, data}

	linkBnea: (data) ->
		debug("linkBnea: #{JSON.stringify(data)}")

		if window.isSteam
			return @steamLinkBnea(data)

		return Promise.resolve(
			fetch "#{@url}/session/bnea_link",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify(data)
		)
		.bind(this)
		.then (@_checkResponse)
		.catch (e) ->
			debug "linkBnea error #{e.message}"
			throw e

	updateLinkBnea: (data) ->
		url = "#{@url}/session/bnea_link"

		if data.usernameOrEmail.indexOf('@') > 0
			data.email = data.usernameOrEmail
		else
			data.username = data.usernameOrEmail

		if window.isSteam
			url = "#{@url}/session/steam_bnea_link"
			data.steam_ticket = @steamTicket

		debug("updateLinkBnea: #{JSON.stringify(data)}")

		return Promise.resolve(
			fetch url,
				method: 'PATCH'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify(data)
		)
		.bind(this)
		.then (@_checkResponse)
		.catch (e) ->
			debug "updateLinkBnea error #{e.message}"
			throw e

	steamLinkBnea: (data) ->
		debug("steamLinkBnea: #{JSON.stringify(data)}")

		return @getSteamAuthTicket()
		.bind(this)
		.then (ticket) =>
			data.steam_ticket = ticket
			return Promise.resolve(
				fetch "#{@url}/session/steam_bnea_link",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/json'
						'Authorization': "Bearer #{@token}"
					body: JSON.stringify(data)
			)
		.then (@_checkResponse)
		.catch (e) ->
			debug "steamLinkBnea error #{e.message}"
			throw e

	unlinkBnea: () ->
		return Promise.resolve(
			fetch "#{@url}/session/bnea_link",
				method: 'DELETE'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
		)
		.bind(this)
		.then (@_checkResponse)
		.catch (e) ->
			debug "unlinkBnea error #{e.message}"
			throw e

	logout: () ->
		debug('logout')
		if window.isSteam
			return

		# if @userId
			# @_deauthFirebase()

		if @token
			fetch "#{@url}/session/logout",
				method: 'GET'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
			.catch () ->

		if process.env.BNEA_ENABLED
			# fire logoff request off but don't care for result or failure
			bnea.logout(@bneaToken)
			.catch () ->

			@bneaToken = null
			@bneaRefresh = null

		@fbRef = null
		@token = null
		@expires = null
		@userId = null
		@username = null
		@analyticsData = null

		# clear storage
		@emit 'logout'

	register: (opts) ->
		debug("register #{JSON.stringify(opts)}")

		opts.is_desktop = window.isDesktop || false

		return Promise.resolve(
			fetch "#{@url}/session/register",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify(opts)
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (data) =>
			debug data
			@justRegistered = true
			@emit 'registered'
			return {email: opts.email, username: opts.username, password: opts.password}

	registerBnea: (opts) ->
		debug("register #{JSON.stringify(opts)}")

		return Promise.resolve(
			fetch "#{@url}/session/bnea_register",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify(opts)
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (data) =>
			debug data
			@justRegistered = true
			@emit 'registered'
			return {email: opts.email, username: opts.username, password: opts.password}

	isEmailAvailable: (email) ->
		return Promise.resolve(
			fetch "#{@url}/session/email_available",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify({email: email})
		)
		.then (res) ->
			# available
			if res.ok then return true
			# 401 result suggests email is bad or unavailable
			if res.status == 401 then return false
			# all other results suggest server is unavailable or had an error
			# so assume email is valid and let the server handle it in the later registration request
			return true
		.catch (e) ->
			debug("isEmailAvailable #{e.message}")
			return true

	isUsernameAvailable: (username) ->
		return Promise.resolve(
			fetch "#{@url}/session/username_available",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify({username: username})
		)
		.then (res) ->
			# available
			if res.ok then return true
			# 401 result suggests email is bad or unavailable
			if res.status == 401 then return false
			# all other results suggest server is unavailable or had an error
			# so assume email is valid and let the server handle it in the later registration request
			return true
		.catch (e) ->
			debug("isUsernameAvailable #{e.message}")
			return true

	changeUsername: (new_username) ->
		return Promise.resolve(
			fetch "#{@url}/session/change_username",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify({new_username: new_username})
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then(@_checkResponse)

	changePassword: (currentPassword, new_password) ->
		return Promise.resolve(
			fetch "#{@url}/session/change_password",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify({
					current_password: currentPassword,
					new_password: new_password
				})
		)
		.bind(this)
		.timeout(5000)
		.catch(@_networkError)
		.then(@_checkResponse)

	changePortrait: (portraitId) ->
		if !portraitId?
			return Promise.reject(new Error("Invalid portrait!"))

		return Promise.resolve(
			fetch "#{@url}/api/me/profile/portrait_id",
				method: 'PUT'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify({portrait_id: portraitId})
		)
		.bind(this)
		.timeout(5000)
		.catch(@_networkError)
		.then(@_checkResponse)

	changeBattlemap: (battlemapId) ->
		return Promise.resolve(
			fetch "#{@url}/api/me/profile/battle_map_id",
				method: 'PUT'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
				body: JSON.stringify({battle_map_id: battlemapId})
		)
		.bind(this)
		.timeout(5000)
		.catch(@_networkError)
		.then(@_checkResponse)

	forgot: (email) ->
		return Promise.resolve(
			fetch "#{@url}/forgot",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify({email: email})
		)
		.bind(this)
		.timeout(10000)
		.catch(@_networkError)
		.then (res) ->
			if res.ok then return email
			if res.status == 404
				throw new Error('That email was not found')
			else
				throw new Error('Please try again')

	isAuthenticated: (token) ->
		if window.isSteam
			return @isAuthenticatedSteamBnea()

		if not token? then return Promise.resolve(false)

		# decode with Firebase
		return @_authFirebase(token)
		.bind(@)
		.timeout(15000)
		.then (decodedToken) =>
			debug('isAuthenticated:authFirebase', decodedToken)
			# use decoded token to init params
			@token = token
			@userId = decodedToken.auth.id
			@username = decodedToken.auth.username
			@expires = decodedToken.expires
			# validate token with our servers
			return fetch "#{@url}/session",
				method: 'GET'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
		.then (res) =>
			debug("isAuthenticated:fetch #{res.ok}")
			if not res.ok then return null
			#TODO: @marwan what is the proper way to prevent _checkResponse's errors from causing this to go to the try catch
			#I'm guessing you were trying to avoid that by only checking res.ok?
			return @_checkResponse(res)
		.then (data) =>
			if data == null then return false

			@analyticsData = data.analytics_data
			@emit 'login', {token: @token, userId: @userId, analyticsData: @analyticsData}
			return true
		.catch (e) ->
			debug("isAuthenticated:failed #{e.message}")
			return false

	isAuthenticatedBnea: (token, bneaToken, bneaRefresh) ->
		if window.isSteam
			return @isAuthenticatedSteamBnea()

		if not token? then return Promise.resolve(false)
		if not bneaToken? then return Promise.resolve(false)
		if not bneaRefresh? then return Promise.resolve(false)

		# decode with Firebase
		return @_authFirebase(token)
		.bind(@)
		.timeout(5000)
		.then (decodedToken) =>
			debug('isAuthenticated:authFirebase', decodedToken)
			# use decoded token to init params
			@token = token
			@userId = decodedToken.auth.id
			@username = decodedToken.auth.username
			@expires = decodedToken.expires
			# validate token with our servers
			return fetch "#{@url}/session",
				method: 'GET'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
		.then (res) =>
			debug("isAuthenticated:fetch #{res.ok}")
			if not res.ok then return null
			return @_checkResponse(res)
		.then (data) =>
			if data == null then return false

			@analyticsData = data.analytics_data

			# attempt to refresh token here otherwise we aren't authed with bnea
			return bnea.refreshToken(bneaToken, bneaRefresh)
			.then (res) =>
				if res.status != 200 && res.body && res.body.status != 'success'
					return false
				else
					@bneaToken = res.body.data.access_token
					@bneaRefresh = res.body.data.refresh_token
					return @getBneaAccountBalance()
					.then () =>
						@emit 'login', {
							token: @token,
							bneaToken: @bneaToken,
							bneaRefresh: @bneaRefresh,
							userId: @userId,
							analyticsData: @analyticsData
						}
						return true
		.catch (e) ->
			debug("isAuthenticated:failed #{e.message}")
			return false

	isAuthenticatedKongregate: (kongregateId, kongregateToken) ->
		if not kongregateId? then return Promise.resolve(false)
		if not kongregateToken? then return Promise.resolve(false)

		return Promise.resolve(
			fetch "#{@url}/session/kongregate_login",
				method: 'POST'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
				body: JSON.stringify({
					kongregate_id: kongregateId,
					kongregate_token: kongregateToken
				})
		)
		.then (res) =>
			if res.ok
				return res.json()
				.then (res) =>
					debug("isAuthenticatedKongregate res #{JSON.stringify(res)}")
					@analyticsData = res.analytics_data
					@token = res.token
					@bneaToken = res.bnea_token
					@bneaRefresh = res.bnea_refresh
					return @_authFirebase(@token)
				.then (res) =>
					@_decodeFirebaseToken(res)
				.then () =>
					# Just fire request for balance without waiting
					@getBneaAccountBalance()
					@emit 'login', {
						token: @token,
						bneaToken: @bneaToken,
						bneaRefresh: @bneaRefresh,
						userId: @userId,
						analyticsData: @analyticsData
					}
					return true
			else
				err = new Error(res.statusText)
				err.status = res.status
				throw err
		.catch (e) ->
			debug("isAuthenticatedKongregate:failed #{e.message}")
			return false
	
	# if fails cause of 404 - then user has never used Steam, show login/registration
	# if fails for any other reason - should quit the application and force them to reload
	isAuthenticatedSteamBnea: () ->
		debug("isAuthenticatedSteamBnea")

		return @getSteamAuthTicket()
		.bind(this)
		.then (ticket) =>
			@steamTicket = ticket
			return Promise.resolve(
				fetch "#{@url}/session/steam_login_bnea",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/json'
					body: JSON.stringify({
						steam_ticket: ticket,
						steam_friends: @getSteamFriends()
					})
			)
		.then (res) =>
			if res.ok
				return res.json()
				.then (res) =>
					debug("isAuthenticatedSteamBnea res #{JSON.stringify(res)}")
					@analyticsData = res.analytics_data
					@token = res.token
					@bneaToken = res.bnea_token
					@bneaRefresh = res.bnea_refresh
					if res.bnea_just_linked
						@bneaJustLinked = res.bnea_just_linked
					return @_authFirebase(@token)
				.then (res) =>
					@_decodeFirebaseToken(res)
				.then () =>
					# Just fire request for balance without waiting
					@getBneaAccountBalance()
					@emit 'login', {
						token: @token,
						bneaToken: @bneaToken,
						bneaRefresh: @bneaRefresh,
						bneaJustLinked: @bneaJustLinked,
						userId: @userId,
						analyticsData: @analyticsData,
						steamTicket: @steamTicket
					}
					return true
			if res.status == 404
				# check if there is a bnea id here
				return res.json()
				.then (res) =>
					# toggle state here, we need to show linking/signup based on response
					# set storage so we have a partial login available
					if res.token
						@analyticsData = res.analytics_data
						@token = res.token
						return @_authFirebase(@token)
						.then (res) =>
							@_decodeFirebaseToken(res)
						.then () =>
							@clearStorage()
							@saveToStorage()
							if res.bnea_id == null
								# set bnea linked to false, unlinked duelyst/bnea account
								Storage.set('bneaLinked', false)
								return true
							else if res.bnea_id != null
								# set bnea linked to true, unlinked bnea/steam account
								Storage.set('bneaLinked', true)
								return true
					else
						# new user, start fresh
						return false
			else if res.status == 409
				debug "isAuthenticatedSteamBnea error: email conflict"
				message = i18next.t("login.unable_to_login_to_account_message ")
				detail = i18next.t("login.email_already_registered_message")
				window.ipcRenderer.send('steam-error', {message: message, detail: detail})
				return false
			else
				err = new Error(res.statusText)
				err.status = res.status
				throw err
		.catch (e) ->
			debug "isAuthenticatedSteamBnea error #{e.message}"
			# show electron native dialog and force quit
			window.ipcRenderer.send('steam-error')
			return false

	createBneaSteamLink: (user) ->
		debug("createBneaSteamLink")

		return @getSteamAuthTicket()
		.bind(this)
		.then (ticket) =>
			user.steam_ticket = ticket
			return Promise.resolve(
				fetch "#{@url}/session/bnea_steam_link",
					method: 'POST'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/json'
						'Authorization': "Bearer #{@token}"
					body: JSON.stringify(user)
			)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (res) =>
			return res

	deleteBneaSteamLink: () ->
		debug("deleteBneaSteamLink")

		return @getSteamAuthTicket()
		.bind(this)
		.then (ticket) =>
			body = {}
			body.steam_ticket = ticket
			body.bnea_token = @bneaToken
			return Promise.resolve(
				fetch "#{@url}/session/steam_bnea_associate",
					method: 'DELETE'
					headers:
						'Accept': 'application/json'
						'Content-Type': 'application/json'
						'Authorization': "Bearer #{@token}"
					body: JSON.stringify(body)
			)
		.timeout(10000)
		.catch(@_networkError)
		.then (@_checkResponse)
		.then (res) =>
			return res

	# Promise wrapper around steam function to get auth ticket
	# Should resolve or quit application
	getSteamAuthTicket: () ->
		return new Promise (resolve, reject) ->
			steamworks.getAuthSessionTicket((ticket) ->
				debug "steam getAuthSessionTicket #{JSON.stringify(ticket)}"
				resolve(ticket.ticket)
			(err) =>
				debug "getSteamAuthTicket error #{err}"
				# show electron native dialog and force quit
				window.ipcRenderer.send('steam-error')
				reject(new Error('Unable to connect to Steam lib'))
			)

	getSteamFriends: () ->
		try
			friends = steamworks.getFriends(steamworks.FriendFlags['Immediate'])
			friends = friends.map (friend) ->
				return friend.steamId
		catch e
			return []

	getCachedBneaAccountBalance: () ->
		return this._cachedPremiumBalance or 0

	getBneaAccountBalance: () ->
		return bnea.accountBalance(@bneaToken)
		.then (balance) =>
			this._cachedPremiumBalance = balance
			return Promise.resolve(this._cachedPremiumBalance)
		.catch (e) =>
			# TODO: we should fire a notification that requesting balance failed instead of possibly showing 0 diamonds
			return Promise.resolve(this._cachedPremiumBalance||0)

	getSteamSkus: () ->
		return bnea.getSteamSkus(@bneaToken)

	initPremiumPurchase: () ->
		return bnea.initPaymentWallLink(@bneaToken)

	watchPlatinumBalance: () ->
		# Firebase.on('users').child('platinum_balance_dirty')
		# emit platinum update event

	refreshToken: (silent = false) ->
		if not @token? then return Promise.resolve(null)
		return Promise.resolve(
			fetch "#{@url}/session",
				method: 'GET'
				headers:
					'Accept': 'application/json'
					'Content-Type': 'application/json'
					'Authorization': "Bearer #{@token}"
		)
		.bind(@)
		.then (res) =>
			debug("refreshToken:fetch #{res.ok}")
			if not res.ok then return null
			return @_checkResponse(res)
		.then (data) =>
			if data == null then return null
			# override existing token and analytics with new ones
			@token = data.token
			@analyticsData = data.analytics_data
			return @_authFirebase(@token)
		.then (decodedToken) =>
			@userId = decodedToken.auth.id
			@username = decodedToken.auth.username
			@expires = decodedToken.expires
			# emit login event with whatever data we currently have
			if !silent
				@emit 'login', {@token, @analyticsData, @userId, @steamTicket, @bneaToken, @bneaRefresh}
			return true
		.catch (e) ->
			debug("refreshToken:failed #{e.message}")
			return null

	refreshBneaToken: () ->
		# TODO: handle error here and set to null if fails
		return bnea.refreshToken(@bneaToken, @bneaRefresh)
		.then (res) =>
			@bneaToken = res.body.data.access_token
			@bneaRefresh = res.body.data.refresh_token
			return {@bneaToken, @bneaRefresh}

	isBneaLinked: () ->
		return Storage.get('bneaLinked')

	# Returns whether this is the player's first session of the day based on their last session timestamp
	# Note: this can change during the session if a new day begins
	getIsFirstSessionOfDay: () ->
		# If no analytics data this is being called before auth, shouldn't happen but return false
		if not @.analyticsData?
			return false

		# Having no last_session_at means this is their first session ever
		if not @.analyticsData.last_session_at?
			return true

		startOfTodayMoment = moment.utc().startOf('day')
		lastSessionStartOfDayMoment = moment.utc(@.analyticsData.last_session_at).startOf('day')

		return lastSessionStartOfDayMoment.valueOf() < startOfTodayMoment.valueOf()

	saveToStorage: () ->
		if @token
			Storage.set('token', @token)
		if window.isSteam && @steamTicket
			Storage.set('steam_ticket', @steamTicket)
		if process.env.BNEA_ENABLED && @bneaToken && @bneaRefresh
			Storage.set('bneaToken', @bneaToken)
			Storage.set('bneaRefresh', @bneaRefresh)

	clearStorage: () ->
		Storage.remove('token')
		Storage.remove('steam_ticket')
		Storage.remove('bneaToken')
		Storage.remove('bneaRefresh')

module.exports = new Session()

module.exports.create = (options) ->
	return new Session(options)
