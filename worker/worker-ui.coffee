colors = require 'colors'
kue = require 'kue'
Logger = require '../app/common/logger.coffee'
worker = require '../server/redis/r-jobs'

###
Start Kue GUI
###
kue.app.listen(4000)
Logger.module("WORKER").log('Worker UI started on port 4000')

###
Kue Events
###
# job enqueue
worker.on "job enqueue", (id, type) ->
  Logger.module("WORKER").log "[J:#{id}] got queued".yellow

# job complete
worker.on "job complete", (id, result) ->
  Logger.module("WORKER").log "[J:#{id}] complete".blue

# job failed
worker.on "job failed", (id, errorMessage) ->
  Logger.module("WORKER").log "[J:#{id}] has failed: #{errorMessage}".red
