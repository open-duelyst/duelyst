Promise 	= require 'bluebird'
request 	= require 'superagent'
config 		= require '../../config/config'
Logger 		= require '../../app/common/logger'
Errors 		= require './custom_errors'
flake			= require '@counterplay/simpleflake'

###*
General Web API documentation found here: https://partner.steamgames.com/documentation/webapi
Authentication API documentation found here: https://partner.steamgames.com/documentation/auth
MicroTxn API documentation found here: https://partner.steamgames.com/documentation/MicroTxn
API explorer: https://lab.xpaw.me/steam_api_documentation.html
###
class Steam

	@apiUrl = config.get('steam.apiUrl')
	@apiKey = config.get('steam.apiKey')
	@appId = config.get('steam.appId')

	###*
	# Makes a request to Steam's Web API to validate a client's session ticket returned
	# from the desktop Steam API. We use this to validate and determinate the user's
	# Steam Id for identification and linking in the database.
	# Tickets are temporary and expire automatically when the user quits Steam.
	# @public
	# @param	{String} ticket - A client-generated ticket from steam.authSessionTicket
	# @return	{Promise.<String>} steamId - user's Steam Id
	###
	@authenticateUserTicket: (ticket) =>
		return new Promise (resolve, reject) =>
			request.get(@apiUrl + '/ISteamUserAuth/AuthenticateUserTicket/V0001/')
			.query({format: 'json'})
			.query({key: @apiKey})
			.query({appid: @appId})
			.query({ticket: ticket})
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if !response.params?
					return reject(new Errors.UnauthorizedError('Steam ticket invalid'))
				else
					return resolve(response.params.steamid)

	###*
	# @public
	# @param	{String}	steamId			Steam Id returned from @authenticateUserTicket
	# @return	{Promise.<Object>} details - user's wallet details
	# @return {String} details.country - 2 letter country code, ie 'US'
	# @return {String} details.currency - 3 letter currency code, ie 'USD'
	# @return {String} details.status - the status of their Steam account, 'Active' or 'Trusted'
	# @return {String} [details.state] - if user is in 'US', will include state
	###
	@getUserInfo: (steamId) =>
		return new Promise (resolve, reject) =>
			request.get(@apiUrl + '/ISteamMicroTxn/GetUserInfo/V0001/')
			.query({format: 'json'})
			.query({key: @apiKey})
			.query({steamid: steamId})
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)

 	###*
	# @typedef steamProduct
	# @type {Object}
	# @property {Number} id
	# @property {Number} qty
	# @property {Number} amount
	# @property {String} description
	# @property {String} [itemstatus] - status of item within the order
	###

	###*
	# @public
	# @param {Object} opts - transaction options
	# @param {Boolean} opts.sandbox - whether to run the transaction in sandbox mode
	# @param {String} opts.steamId - Steam Id returned from @authenticateUserTicket
	# @param {Array.<steamProduct>} opts.items - array of Steam products for invoice (line items)
	# @param {String} [opts.language='EN'] - language for invoice
	# @param {String} [opts.currency='USD'] - currency for invoice
	# @return	{Promise.<Object>} txn
	# @return {String} txn.orderid - our own generated order Id
	# @return {String} txn.transid - transaction Id
	# @return {String} txn.steamurl - url to invoice to open to complete/cancel the transaction
	###
	@initTxn: (opts) =>
		if !opts.steamId || !Array.isArray(opts.items)
			throw new Error('Missing required parameters')

		if opts.sandbox
			url = '/ISteamMicroTxnSandbox/InitTxn/V0002/'
		else
			url = '/ISteamMicroTxn/InitTxn/V0002/'

		data = {
			appid: @appId
			orderid: flake().toString('base10')
			steamid: opts.steamId
			language: opts.language || 'EN'
			currency: opts.currency || 'USD'
			usersession: 'web'
		}
		data.itemcount = opts.items.length

		opts.items.forEach (item, index) =>
			data["itemid[#{index}]"] = item.id
			data["qty[#{index}]"] = item.qty
			data["amount[#{index}]"] = item.amount
			data["description[#{index}]"] = item.description

		return new Promise (resolve, reject) =>
			request.post(@apiUrl + url)
			.query({format: 'json'})
			.query({key: @apiKey})
			.type('form')
			.send(data)
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)

	###*
	# @public
	# @param {Object} opts - transaction options
	# @param {Boolean} opts.sandbox - whether to run the transaction in sandbox mode
	# @param {String} opts.orderId - order Id of transaction to query
	# @return	{Promise.<Object>} txn
	# @return {String} txn.status - status of transaction (Init|Approved|Succeeded|Failed|Refunded|PartialRefund|Chargedback)
	# @return {String} txn.orderid - our own generated order Id
	# @return {String} txn.transid - transaction Id
	# @return {String} txn.steamid - steam Id used for transaction
	# @return {String} txn.currency - 3 letter currency code
	# @return {String} txn.country - 2 letter country code
	# @return {String} txn.usstate - state code if country = 'US'
	# @return {String} txn.time - timestamp of transaction
	# @return {Array.<steamProduct>} txn.items - array of Steam products
	###
	@queryTxn: (opts) =>
		if !opts.orderId and !opts.transactionId
			throw new Error('Missing required parameters')

		if opts.sandbox # || config.get('steam.sandbox')
			url = '/ISteamMicroTxnSandbox/QueryTxn/V0002/'
		else
			url = '/ISteamMicroTxn/QueryTxn/V0002/'

		return new Promise (resolve, reject) =>
			req = request.get(@apiUrl + url)
			.query({format: 'json'})
			.query({key: @apiKey})
			.query({appid: @appId})

			if opts.orderId
				req.query({orderid: opts.orderId})

			if opts.transactionId
				req.query({transid: opts.transactionId})

			req.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)

	###*
	# @public
	# @param {Object} opts - transaction options
	# @param {Boolean} opts.sandbox - whether to run the transaction in sandbox mode
	# @param {String} opts.orderId - order Id of transaction to query
	# @return	{Promise.<Object>} txn
	# @return {String} txn.orderid - our own generated order Id
	# @return {String} txn.transid - transaction Id
	###
	@finalizeTxn: (opts) =>
		if !opts.orderId
			throw new Error('Missing required parameters')

		if opts.sandbox
			url = '/ISteamMicroTxnSandbox/FinalizeTxn/V0002/'
		else
			url = '/ISteamMicroTxn/FinalizeTxn/V0002/'

		return new Promise (resolve, reject) =>
			request.post(@apiUrl + url)
			.query({format: 'json'})
			.query({key: @apiKey})
			.type('form')
			.send({orderid: opts.orderId, appid: @appId})
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)

	###*
	# @public
	###
	@refundTxn: (opts) =>
		if !opts.orderId
			throw new Error('Missing required parameters')

		if opts.sandbox
			url = '/ISteamMicroTxnSandbox/RefundTxn/V0002/'
		else
			url = '/ISteamMicroTxn/RefundTxn/V0002/'

		return new Promise (resolve, reject) =>
			request.post(@apiUrl + url)
			.query({format: 'json'})
			.query({key: @apiKey})
			.type('form')
			.send({orderid: opts.orderId, appid: @appId})
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)

	###*
	# @public
	###
	@getReport: (opts) =>
		if opts.sandbox
			url = '/ISteamMicroTxnSandbox/GetReport/V0002/'
		else
			url = '/ISteamMicroTxn/GetReport/V0002/'

		return new Promise (resolve, reject) =>
			request.get(@apiUrl + url)
			.query({format: 'json'})
			.query({key: @apiKey})
			.query({appid: @appId})
			.query({time: opts.time || '2016-01-01T00:00:00Z'})
			.query({maxresults: opts.maxResults || 1000})
			.end (err, res) ->
				err = err || res.error
				if err
					return reject(err)
				if res.status != 200
					return reject(new Error('Steam API request failed'))
				response = res.body.response
				if response.error?
					e = new Error('Steam API request failed')
					e.steamerror = response.error.errordesc
					e.steamcode = response.error.errorcode
					return reject(e)
				if !response.params?
					return reject(new Error('Steam API request failed'))
				else
					return resolve(response.params)


module.exports = Steam
