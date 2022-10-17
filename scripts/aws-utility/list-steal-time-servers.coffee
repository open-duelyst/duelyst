AWS = require 'aws-sdk'
Promise = require 'bluebird'
prettyjson = require 'prettyjson'
_ = require 'underscore'
moment = require 'moment'
ProgressBar = require 'progress'
moniker = require 'moniker'
inquirer = require 'inquirer'
request = require 'request'
requestAsync = Promise.promisify(request)

ec2 = new AWS.EC2({region:'us-west-2'})
opsworks = new AWS.OpsWorks({region:'us-east-1'})
cloudwatch = new AWS.CloudWatch({region:'us-east-1'})
Promise.promisifyAll(ec2)
Promise.promisifyAll(opsworks)
Promise.promisifyAll(cloudwatch)

environment = "staging"
STACK_ID = "25f5d045-5e8f-4fb4-a7b4-4bdbd90935c1"
GAME_LAYER_ID = "e67f9dfa-b0f5-44f7-ab82-900ab0f1734f"
AI_LAYER_ID = "678a9191-d9e0-4ba3-b2f2-ac788e38abfa"

if process.env.NODE_ENV == "production"
  console.log "PRODUCTION MODE"
  environment = "production"
  STACK_ID = "67804928-7fd2-449f-aec7-15acfba70874"
  GAME_LAYER_ID = "5de77de8-f748-4df4-a85a-e40dccc1a05f"
  AI_LAYER_ID = "cece3db3-e013-4acc-9ca8-ef59113f41e3"

###*
# console.log data as a table
# @public
# @param  {String}  data      data to print out.
###
logAsTable = (dataRows)->
  keys = _.keys(dataRows[0])
  Table = require('cli-table')
  t = new Table({
    head: keys
  })
  _.each dataRows, (r)->
    values = _.values(r)
    values = _.map values, (v)->
      if v instanceof Date
        v = moment(v).format("YYYY-MM-DD")
      return v || ""
    t.push values

  strTable = t.toString()
  console.log(strTable)
  return strTable

###*
# Custom error used by the confirmation prompt promise
# @class
###
class DidNotConfirmError extends Error
  constructor: (@message = "You did not confirm.") ->
    @name = "DidNotConfirmError"
    @status = 404
    @description = "You did not confirm."
    Error.captureStackTrace(this, DidNotConfirmError)
    super(@message)

###*
# Show a general purpose confirmation prompt
# @public
# @param  {String}  msg      Custom confirmation message.
# @return  {Promise}        Promise that will resolve if the user confirms with a 'Y' or reject with DidNotConfirmError otherwise.
###
confirmAsync = (msg="...")->
  return new Promise (resolve,reject)->
    inquirer.prompt [{
      name:'confirm'
      message:"<#{environment}> #{msg} continue? Y/N?"
    }],(answers)->
      if answers.confirm.toLowerCase() == "y"
        resolve()
      else
        reject(new DidNotConfirmError())

console.log "grabbing instance data for opsworks..."
console.time "done loading instance data"

Promise.all([
  opsworks.describeInstancesAsync({
    LayerId:AI_LAYER_ID
  }),
  opsworks.describeInstancesAsync({
    LayerId:GAME_LAYER_ID
  })
])

.bind {}

.spread (aiInstances,gameInstances)-> # after getting instances, load metric data from CloudWatch for CPU STEAL TIME

  console.timeEnd "done loading instance data"

  # console.log gameInstances

  aiInstances = _.map(aiInstances.Instances, (instance)->
    return _.pick(instance,[
      "InstanceId",
      "Hostname",
      "PrivateIp",
      "PublicIp",
      "Status"
    ])
  )

  gameInstances = _.map(gameInstances.Instances, (instance)->
    return _.pick(instance,[
      "InstanceId",
      "Hostname",
      "PrivateIp",
      "PublicIp",
      "Status"
    ])
  )

  @.aiInstances = _.filter aiInstances, (i)-> return i["Status"] == "online"
  @.gameInstances =  _.filter gameInstances, (i)-> return i["Status"] == "online"

  bar = new ProgressBar('getting metric data [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: parseInt(@.gameInstances.length)
  })

  return Promise.map(@.gameInstances,(instance,index)=>
    return cloudwatch.getMetricStatisticsAsync({
      Namespace: "AWS/OpsWorks"
      MetricName: "cpu_steal"
      Period: 60 * 60 # 1 hour
      Statistics: ["Maximum"]
      StartTime: moment().utc().subtract(1,'hour').toDate()
      EndTime: moment().utc().toDate()
      Dimensions: [
        {
          Name: "InstanceId"
          Value: instance.InstanceId
        }
      ]
    }).then (result)->
      instance.MaxStealTime = result["Datapoints"][0]["Maximum"]
      bar.tick()
  {concurrency:25})

.then ()-> # get HEALTH (player count) data for each server

  # @.gameInstances = _.filter(@.gameInstances, (instance)-> return instance["MaxStealTime"] > 1.0 )

  bar = new ProgressBar('getting health data [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: parseInt(@.gameInstances.length)
  })

  return Promise.map(@.gameInstances,(instance,index)=>
    return requestAsync({url: "http://#{instance.PublicIp}/health"})
    .spread (res,body)-> return JSON.parse(body)
    .then (response)->
      instance.Players = response.players
      instance.Games = response.games
      bar.tick()
  {concurrency:25})

.then ()-> # load CONSUL maintenance info data for each instance

  bar = new ProgressBar('getting consul data [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: parseInt(@.gameInstances.length)
  })

  return Promise.map(@.gameInstances,(instance,index)=>
    url = "https://consul.duelyst.com/v1/health/node/#{environment}-#{instance.Hostname}"
    return requestAsync({url: url})
    .spread (res,body)->
      return JSON.parse(body)
    .then (response)->
      maintenance = _.find(response,(item)-> return item["CheckID"] == "_node_maintenance")
      if maintenance
        instance.MaintMode = true
      else
        instance.MaintMode = false
      bar.tick()
  {concurrency:25})

.then (results)-> # when all data is loaded, retire any instances that have HIGH steal time

  instances = @.gameInstances
  # instances = _.filter(instances, (instance)-> return instance["MaxStealTime"] > 1.0 )
  instances = _.sortBy(instances,"MaxStealTime")

  logAsTable(instances)

  @.retiredInstances = instances
  # @.retiredInstances = _.filter @.retiredInstances, (i)-> i.Hostname == "api-game1s-wakeful-substance"
  @.retiredInstances = _.filter @.retiredInstances, (instance)-> return instance["MaxStealTime"] > 5.0 and instance["MaintMode"] != true
  retiredInstanceIds = _.map(@.retiredInstances,(i)-> return i.InstanceId)

  if @.retiredInstances.length > 0
    console.log "retiring instances: ", _.map(@.retiredInstances,(i)-> return i.Hostname)
    return confirmAsync("Retiring instances.")

.then ()-> #... after confirmation retire

  if @.retiredInstances.length > 0
    retiredInstanceIds = _.map(@.retiredInstances,(i)-> return i.InstanceId)
    params = {
      Command:
        Name:"execute_recipes"
        Args:
          recipes: ["sarlac::consul_maint_on"]
      StackId: STACK_ID
      InstanceIds: retiredInstanceIds
      Comment: "Batch retiring instances"
    }
    console.log params
    return opsworks.createDeploymentAsync(params)

.then ()-> # for each retired instance, create a substitute

  allPromises = []

  for instance in @.retiredInstances

    match = instance.Hostname.match(/^(([a-z]+\-)+)+([a-z]+[0-9]+[a-z]*)(\-[a-z]+)*$/)
    instanceName = match[1]
    instanceNumber = match[3]

    newName = "#{instanceName}#{instanceNumber}-#{moniker.choose()}"

    console.log "creating new instance #{newName}"

    instanceParams =
      Hostname: newName
      LayerIds: [GAME_LAYER_ID]
      StackId: STACK_ID
      SshKeyName: "counterplay"
      Os: "Custom"
      AmiId: "ami-93e0faf2"
      InstallUpdatesOnBoot: false
      InstanceType: "m4.large"

    # console.log instanceParams
    allPromises.push opsworks.createInstanceAsync(instanceParams)

  return Promise.all(allPromises)

.then (results)-> # start each new substitute instance

  if results?.length > 0

    bar = new ProgressBar('starting instances [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: parseInt(results.length)
    })

    return Promise.map results, (instance) ->
      return opsworks.startInstanceAsync({
        InstanceId: instance.InstanceId
      }).then ()->
        bar.tick()

.then ()-> # done...

  console.log "ALL DONE"

.catch DidNotConfirmError, (e)->

  console.log "ABORTED"
