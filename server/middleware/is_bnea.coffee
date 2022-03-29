express = require 'express'
expressJwt = require 'express-jwt'
compose = require('compose-middleware').compose
config = require '../../config/config'
secret = config.get('bnea.serverToServerSecret')

module.exports = compose([
	expressJwt({secret: secret}),
	(req, res, next) ->
		if !req.user.admin
			return res.status(401).end()
		else
			return next()
])
