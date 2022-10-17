###
Starts main application
###
os = require 'os'
fs = require 'fs'
path = require 'path'
mkdirp = require 'mkdirp'
request = require 'request'
Promise = require 'bluebird'
Logger = require '../app/common/logger'
shutdownLib = require './shutdown'

# Setup http server and express app
app = require "./express"
server = require('http').createServer(app)

# Configuration object
config = require '../config/config.js'
env = config.get('env')
cdnDomain = config.get('aws.cdnDomainName')
cdnUrl = "https://#{cdnDomain}/#{env}"
apiPort = config.get('port')

if config.isDevelopment()
  Logger.module("SERVER").log "DEV MODE: enabling long stack support"
  process.env.BLUEBIRD_DEBUG = 1
  Promise.longStackTraces()

# Methods to download assets from S3
# TODO : Put in module
makeDirectory = (cb) ->
  pubDir = "#{__dirname}/../public/#{env}"
  Logger.module("API").warn "Creating directory #{pubDir}"
  mkdirp pubDir, (err) ->
    if err?
      Logger.module("API").error "Failed to create directory #{pubDir}: #{err}"
      cb err
    else
      cb null

downloadIndexHtml = (url, cb) ->
  origin = "#{url}/index.html"
  destination = "#{__dirname}/../public/#{env}/index.html"
  Logger.module("API").warn "Downloading #{origin} to #{destination}."

  request(url: origin, gzip: true)
  .on 'error', (err) ->
    cb err
  .on 'response', (res) ->
    if res.statusCode != 200
      cb new Error("request returned status #{res.statusCode}")
  .pipe fs.createWriteStream(destination)
  .on 'error', (err) ->
    Logger.module("API").error "Failed to download #{origin} to #{destination}"
    cb err
  .on 'finish', () ->
    Logger.module("API").warn "Downloaded #{origin} to #{destination}"
    cb null

downloadRegisterHtml = (url, cb) ->
  origin = "#{url}/register.html"
  destination = "#{__dirname}/../public/#{env}/register.html"
  Logger.module("API").warn "Downloading #{origin} to #{destination}."

  request(url: origin, gzip: true)
  .on 'error', (err) ->
    Logger.module("API").error "Failed to download #{origin}: #{err}"
    cb err
  .on 'response', (res) ->
    if res.statusCode != 200
      cb new Error("request returned status #{res.statusCode}")
  .pipe fs.createWriteStream(destination)
  .on 'error', (err) ->
    Logger.module("API").error "Failed to write #{origin} to #{destination}: #{err}"
    cb err
  .on 'finish', () ->
    Logger.module("API").warn "Downloaded #{origin} to #{destination}"
    cb null

setupDevelopment = () ->
  server.listen apiPort, () ->
    server.connected = true
    Logger.module("SERVER").log "Duelyst '#{env}' started on port #{apiPort}"

setupProduction = () ->
  makeDirectory (err) ->
    if err?
      Logger.module("SERVER").error "setupDirectory() failed; exiting: #{err}"
      process.exit(1)
    else
      # FIXME: register.html is not currently in the build.
      downloadRegisterHtml cdnUrl, (err) ->
        if err?
          Logger.module("SERVER").warn "downloadRegisterHtml() failed: #{err}"
      downloadIndexHtml cdnUrl, (err) ->
        if err?
          Logger.module("SERVER").error "downloadIndexHtml() failed; exiting: #{err}"
          process.exit(1)
        else
          server.listen apiPort, () ->
            server.connected = true
            Logger.module("SERVER").log "Duelyst '#{env}' started on port #{apiPort}"

process.on 'uncaughtException', (err) ->
  shutdownLib.errorShutdown(err)

if config.isDevelopment()
  setupDevelopment()
else
  setupProduction()
