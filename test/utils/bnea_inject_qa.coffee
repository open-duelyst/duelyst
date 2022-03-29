Promise 	= require 'bluebird'
request 	= require 'superagent'

# Adds method for adding bn currency for unit tests to bnea module

module.exports = (bnea) ->
	if not bnea?
		throw new Error("bnea_inject_qa requires passing bnea into it.")
		return
	if not bnea.addStagingCurrency?
		###*
		Add currency to an account - only works on staging
		###
		bnea.addStagingCurrency = (bToken, amount, clientIp = null) ->
			headers = @defaultHeaders
			if clientIp
				headers['X-Forwarded-For'] = clientIp

			return request.post("#{@apiUrl}/accounts/me/platinums")
			.accept('application/json')
			.type('application/json')
			.set(headers)
			.set('Authorization', "Bearer #{bToken}")
			.send({amount:amount})
	return