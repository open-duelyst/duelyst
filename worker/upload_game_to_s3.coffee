Promise = require "bluebird"
_ = require "underscore"
colors = require 'colors'
url = require 'url'
zlib = require 'zlib'
{ S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

Logger = require '../app/common/logger.coffee'
config = require '../config/config.js'

env = config.get('env')
awsRegion = config.get('aws.region')
replaysBucket = config.get('aws.replaysBucketName')

if env == 'development'
	s3Opts =
		region: awsRegion
		accessKeyId: config.get('aws.accessKey')
		secretAccessKey: config.get('aws.secretKey')
else
	s3Opts =
		region: awsRegion

s3Client = new S3Client(s3Opts)
Logger.module("REPLAYS").log "Created S3 client with Region #{awsRegion} and Bucket #{replaysBucket}"

Promise.promisifyAll(zlib)

# returns promise for s3 upload
# takes *serialized* game data
upload = (gameId, serializedGameSession, serializedMouseUIEventData) ->
	Logger.module("REPLAYS").log "uploading game #{gameId} to S3"

	allDeflatePromises = [
		zlib.gzipAsync(serializedGameSession)
	]

	if serializedMouseUIEventData?
		allDeflatePromises.push(zlib.gzipAsync(serializedMouseUIEventData))

	filename = env + "/" + gameId + ".json"

	return Promise.all(allDeflatePromises)
	.spread (gzipGameSessionData, gzipMouseUIEventData)->
		Logger.module("REPLAYS").log "done compressing game #{gameId} for upload"
		allPromises = []

		if gzipGameSessionData?
			params =
				Bucket: replaysBucket
				Key: filename
				Body: gzipGameSessionData
				ACL: 'public-read'
				ContentEncoding: "gzip"
				ContentType: "text/json"
			cmd = new PutObjectCommand(params)
			allPromises.push(s3Client.send(cmd))

		if gzipMouseUIEventData?
			params =
				Bucket: replaysBucket
				Key: env + "/ui_events/" + gameId + ".json"
				Body: gzipMouseUIEventData
				ACL: 'public-read'
				ContentEncoding: "gzip"
				ContentType: "text/json"
			cmd = new PutObjectCommand(params)
			allPromises.push(s3Client.send(cmd))

		return Promise.all(allPromises)
	.spread (gameDataPutResp, mouseDataPutResp) ->
		url = "https://s3.#{awsRegion}.amazonaws.com/" + replaysBucket + "/" + filename
		return url
	.catch (e)->
		Logger.module("REPLAYS").error "ERROR uploading game #{gameId} to S3: #{e.message}"
		throw e

module.exports = upload
