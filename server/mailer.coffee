fs = require 'fs'
os = require 'os'
path = require 'path'
nodemailer = require 'nodemailer'
hbs = require 'hbs'
handlebars = hbs.handlebars
config = require '../config/config.js'

# Pretty error printing, helps with stack traces
PrettyError = require 'pretty-error'
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.withoutColors()
prettyError.skipPackage('bluebird')

env = config.get('env')
if env is 'development'
	base_url = "http://localhost:#{config.get('port')}"
else if env is 'staging'
	base_url = ""
else if env is 'production'
	base_url = ""

class Email

	constructor: () ->
		@loadTemplates()

		@transporter = nodemailer.createTransport
			host: 'smtp.mandrillapp.com'
			port: 587
			auth:
				user: ''
				pass: ''

	loadTemplates: () ->
		try
			@default_template = fs.readFileSync(__dirname + '/templates/email-default.hbs').toString()
			@signup_template = fs.readFileSync(__dirname + '/templates/email-signup.hbs').toString()
			@resend_template = fs.readFileSync(__dirname + '/templates/email-resend.hbs').toString()
			@taken_template =  fs.readFileSync(__dirname + '/templates/email-taken.hbs').toString()
			@forgot_template = fs.readFileSync(__dirname + '/templates/email-forgot.hbs').toString()
			@verify_template = fs.readFileSync(__dirname + '/templates/email-verify.hbs').toString()
			@confirm_template = fs.readFileSync(__dirname + '/templates/email-confirm.hbs').toString()
			@alert_template = fs.readFileSync(__dirname + '/templates/email-alert.hbs').toString()
			@steam_alert_template = fs.readFileSync(__dirname + '/templates/email-steam-alert.hbs').toString()
			@notify_template = fs.readFileSync(__dirname + '/templates/email-notify.hbs').toString()
			@receipt_template = fs.readFileSync(__dirname + '/templates/email-receipt.hbs').toString()
			@giftcrate_template = fs.readFileSync(__dirname + '/templates/email-giftcrate.hbs').toString()
		catch e
			throw new Error("Failed to load email templates.")

	sendMail: (username, email, title, message, cb) ->
		template = handlebars.compile(@default_template)
		html = template({title: title, base_url: base_url, username: username, message: message})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "DUELYST - #{title}"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendEmailVerificationLink: (username, email, token, cb) ->
		template = handlebars.compile(@verify_template)
		html = template({title: 'Verify Email', base_url: base_url, username: username, token: token})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Verify your DUELYST account email"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendSignup: (username, email, token, cb) ->
		template = handlebars.compile(@signup_template)
		html = template({title: 'Welcome', base_url: base_url, username: username, token: token})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Welcome to DUELYST"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendReceipt: (username, email, receiptNumber, boosterCount, cb) ->
		template = handlebars.compile(@receipt_template)
		html = template({title: 'Welcome', base_url: base_url, username: username, receipt_number: receiptNumber, booster_count:boosterCount})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "DUELYST Purchase Receipt"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	resendSignup: (username, email, token, cb) ->
		template = handlebars.compile(@resend_template)
		html = template({title: 'Confirm', base_url: base_url, username: username, token: token})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Duelyst - Complete your registration"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendTakenEmail: (username, email, token, cb) ->
		template = handlebars.compile(@taken_template)
		html = template({title: 'Taken', username: username, token: token})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Duelyst - Email already registered"
			html: html
			# plaintext fallback
			# text: ''
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendForgotPassword: (username, email, token, cb) ->
		template = handlebars.compile(@forgot_template)
		html = template({title: 'Reset', base_url: base_url, username: username, token: token})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Duelyst - Reset your password"
			html: html
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendPasswordConfirmation: (username, email, cb) ->
		template = handlebars.compile(@confirm_template)
		html = template({title: 'Reset', base_url: base_url, username: username})
		opts = {
			from: 'support@duelyst.com'
			to: email
			subject: "Duelyst - Password has been updated"
			html: html
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendNotification: (title, message, cb) ->
		template = handlebars.compile(@notify_template)
		html = template({title: title, message: message})
		opts = {
			from: "admin@duelyst.com"
			to: "servers+#{env}@counterplay.co"
			subject: "[#{env}] Duelyst - NOTIFICATION - #{title}"
			html: html
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendTeamPurchaseNotification: (username, userId, email, chargeId, price, cb) ->
		opts = {
			from: "admin@counterplay.co"
			to: "purchase-notifications@counterplay.co"
			subject: "[#{env}] Duelyst - PURCHASE - #{username} spent #{price} - #{chargeId}"
			html: "#{username} (email:#{email}) (id:#{userId}) spent #{price}. Charge ID #{chargeId}"
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendTeamPurchaseErrorNotification: (subject, message, cb) ->
		opts = {
			from: "admin@counterplay.co"
			to: "purchase-error-notifications@counterplay.co"
			subject: "[#{env}] Duelyst - NOTIFICATION - #{subject}"
			html: message
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendErrorAlert: (server, error, cb) ->
		template = handlebars.compile(@alert_template)
		html = template({title: 'Server Error', base_url: base_url, server: JSON.stringify(server), error: error})
		opts = {
			from: "admin@duelyst.com"
			to: "server-errors+#{env}@counterplay.co"
			subject: "[#{env}] Duelyst - SERVER ALERT! #{server.hostname}"
			html: html
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendCrashAlert: (server, error, cb) ->
		prettyErrorInfo = prettyError.render(error)
		template = handlebars.compile(@alert_template)
		html = template({title: 'Server Crash', base_url: base_url, server: JSON.stringify(server), error: error, prettyErrorInfo: prettyErrorInfo})
		opts = {
			from: "admin@duelyst.com"
			to: "server-alerts+#{env}@counterplay.co"
			subject: "[#{env}] Duelyst - SERVER CRASH! #{server.hostname}"
			html: html
			# plaintext fallback
			# text: ''
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendSteamAlert: (txn, server, error, cb) ->
		template = handlebars.compile(@steam_alert_template)
		html = template({
			title: 'Steam Transaction Error',
			base_url: base_url,
			txn: JSON.stringify(txn),
			server: JSON.stringify(server),
			error: error
		})
		opts = {
			from: "admin@duelyst.com"
			to: "server-errors+#{env}@counterplay.co"
			subject: "[#{env}] Duelyst - Steam Transaction Error! #{server.hostname}"
			html: html
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendPlayerReport: (playerUsername, playerId, message, fromUserId, fromEmail = null, cb) ->
		opts = {
			from: fromEmail || "admin@duelyst.com"
			to: "player-abuse-reports@counterplay.co"
			subject: "[#{env}] REPORT: #{playerUsername} (#{playerId}) reported"
			text: "#{message}\n\n =============== \n\n by #{fromUserId}"
		}

		@transporter.sendMail opts, (error, info) ->
			if cb?
				if error
					return cb(error)
				else
					return cb(null, info.response)

	sendCRMActivityReport: (subject, htmlMessage, cb)->

		opts = {
			from: "admin@duelyst.com"
			to: "servers+#{env}@counterplay.co"
			subject: "[#{env}] Duelyst - CRM ACTIVITY - #{subject}"
			html: htmlMessage
		}
		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

	sendGiftCrate: (username, email, cb) ->
		template = handlebars.compile(@giftcrate_template)
		html = template({title: 'Come unlock your FREE gift crate', base_url: base_url, username: username})
		opts = {
			from: 'DUELYST <support@duelyst.com>'
			to: email
			subject: "FREE Duelyst Gift Crate"
			html: html
		}

		@transporter.sendMail opts, (error, info) ->
			if error
				return cb(error)
			else
				return cb(null, info.response)

module.exports = new Email
