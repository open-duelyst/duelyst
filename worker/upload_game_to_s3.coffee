Promise = require "bluebird"
_ = require "underscore"
colors = require 'colors'
url = require 'url'
zlib = require 'zlib'
{ S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

Logger = require '../app/common/logger.coffee'
config = require '../config/config.js'

# create a S3 API client
s3Client = new S3Client({
	region: config.get('aws.region'),
	accessKey: config.get('aws.accessKey'),
	secretKey: config.get('aws.secretKey'),
})

# Promise.promisifyAll(s3)
Promise.promisifyAll(zlib)

# returns promise for s3 upload
# takes *serialized* game data
upload = (gameId, serializedGameSession, serializedMouseUIEventData) ->
	Logger.module("S3").debug "uploading game #{gameId} to S3"

	bucket = config.get('aws.replaysBucketName')
	env = config.get('env')
	filename = env + "/" + gameId + ".json"
	url = "https://s3-us-west-1.amazonaws.com/" + bucket + "/" + filename

	allDeflatePromises = [
		zlib.gzipAsync(serializedGameSession)
	]

	if serializedMouseUIEventData?
		allDeflatePromises.push(zlib.gzipAsync(serializedMouseUIEventData))

	return Promise.all(allDeflatePromises)
	.spread (gzipGameSessionData, gzipMouseUIEventData)->
		Logger.module("S3").debug "done compressing game #{gameId} for upload"
		allPromises = []

		if gzipGameSessionData?
			params =
				Bucket: bucket
				Key: filename
				Body: gzipGameSessionData
				ACL: 'public-read'
				ContentEncoding: "gzip"
				ContentType: "text/json"
			cmd = PutObjectCommands(params)
			allPromises.push(s3Client.send(cmd))

		if gzipMouseUIEventData?
			params =
				Bucket: bucket
				Key: env + "/ui_events/" + gameId + ".json"
				Body: gzipMouseUIEventData
				ACL: 'public-read'
				ContentEncoding: "gzip"
				ContentType: "text/json"
			cmd = PutObjectCommand(params)
			allPromises.push(s3Client.send(cmd))

		return Promise.all(allPromises)
	.spread (gameDataPutResp,mouseDataPutResp)->
		return url
	.catch (e)->
		Logger.module("S3").error "ERROR uploading game #{gameId} to S3: "#{e.message}
		throw e

module.exports = upload
