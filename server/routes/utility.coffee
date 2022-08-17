express = require 'express'
router = express.Router()

expressJwt = require 'express-jwt'
util = require 'util'
uuid = require 'node-uuid'
AWS = require "aws-sdk"
Promise = require "bluebird"
fs = require 'fs'
hbs = require 'hbs'
handlebars = hbs.handlebars
moment = require 'moment'

generatePushId = require '../../app/common/generate_push_id'

# lib Modules
isSignedIn = require '../middleware/signed_in'
Logger = require '../../app/common/logger.coffee'
Errors = require '../lib/custom_errors'

# Configuration object
config = require '../../config/config.js'

# set up AWS
AWS.config.update
  accessKeyId: config.get("s3_client_logs.key")
  secretAccessKey: config.get("s3_client_logs.secret")

# create a S3 API client
s3 = new AWS.S3()
#Promise.promisifyAll(s3)

# async promise to get client template
loadClientLogsHandlebarsTemplateAsync = new Promise (resolve,reject) ->
	readFile = Promise.promisify(require("fs").readFile)
	readFile(__dirname + '/../templates/client-logs.hbs')
	.then (template)->
		hbs_template = handlebars.compile(template.toString())
		resolve(hbs_template)
	.catch (err) ->
		reject(err)

## Require authetication
router.use '/utility', isSignedIn

router.post "/utility/client_logs", (req, res, next) ->
	user_id = req.user.d.id
	log_id = moment().utc().format("YYYY-MM-DD---hh-mm-ss")
	log_id += ".#{uuid.v4()}"

	bucket = config.get("s3_client_logs.bucket")
	env = config.get("env")
	filename = env + "/#{user_id}/#{log_id}.html"
	url = "https://s3-us-west-1.amazonaws.com/" + bucket + "/" + filename

	loadClientLogsHandlebarsTemplateAsync.then (template) ->
		# render client log as HTML
		html = template(req.body)

		# upload parameters
		params =
			Bucket: bucket
			Key: filename
			Body: html
			ACL:'public-read'
			ContentType:'text/html'

		return s3.putObjectAsync(params)
	.then () ->
		Logger.module("EXPRESS").debug "User #{user_id.blue} Client Logs Submitted to: #{url}"
		res.status(200).json({ logs_url: url })
	.catch (err) ->
		Logger.module("EXPRESS").error "ERROR UPLOADING #{user_id.blue} CLIENT LOGS to #{url} : #{err.message}".red
		next(err)

module.exports = router
