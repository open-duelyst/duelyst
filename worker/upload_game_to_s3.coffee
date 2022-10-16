#AWS = require "aws-sdk"
Promise = require "bluebird"
_ = require "underscore"
colors = require 'colors'
url = require 'url'
zlib = require 'zlib'

Logger = require '../app/common/logger.coffee'
config = require '../config/config.js'

#AWS.config.update
#  accessKeyId: config.get("s3_archive.key")
#  secretAccessKey: config.get("s3_archive.secret")

# create a S3 API client
#s3 = new AWS.S3()

# promisifyAll
# Promise.promisifyAll(s3)

# returns promise for s3 uploaded, takes *serialized* game data
upload = (gameId, serializedGameSession, serializedMouseUIEventData) ->
	# TODO: Stubbed for now
	Logger.module("S3").debug "TODO: Fix uploading game #{gameId} to S3"
	return Promise.resolve('todo-replay-data-link.json')
	
	# Logger.module("S3").debug "uploading game #{gameId} to S3"

	# bucket = config.get("s3_archive.bucket")
	# env = config.get('env')
	# filename = env + "/" + gameId + ".json"
	# url = "https://s3-us-west-1.amazonaws.com/" + bucket + "/" + filename

	# # promisify
	# Promise.promisifyAll(zlib)

	# allDeflatePromises = [
	# 	zlib.gzipAsync(serializedGameSession)
	# ]

	# if serializedMouseUIEventData?
	# 	allDeflatePromises.push(zlib.gzipAsync(serializedMouseUIEventData))

	# return Promise.all(allDeflatePromises)
	# .spread (gzipGameSessionData,gzipMouseUIEventData)->
	# 	Logger.module("S3").debug "done compressing game #{gameId} for upload"
	# 	#
	# 	allPromises = []

	# 	if gzipGameSessionData?
	# 		# upload parameters
	# 		params =
	# 			Bucket: bucket
	# 			Key: filename
	# 			Body: gzipGameSessionData
	# 			ACL: 'public-read'
	# 			ContentEncoding: "gzip"
	# 			ContentType: "text/json"
	# 		allPromises.push(s3.putObjectAsync(params))

	# 	if gzipMouseUIEventData?
	# 		# upload parameters
	# 		params =
	# 			Bucket: bucket
	# 			Key: env + "/ui_events/" + gameId + ".json"
	# 			Body: gzipMouseUIEventData
	# 			ACL: 'public-read'
	# 			ContentEncoding: "gzip"
	# 			ContentType: "text/json"
	# 		allPromises.push(s3.putObjectAsync(params))

	# 	return Promise.all(allPromises)
	# .spread (gameDataPutResp,mouseDataPutResp)->
	# 	return url
	# .catch (e)->
	# 	Logger.module("S3").error "ERROR uploading game #{gameId} to S3: "#{e.message}
	# 	throw e

module.exports = upload
