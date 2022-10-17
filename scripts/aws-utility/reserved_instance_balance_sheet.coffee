AWS = require 'aws-sdk'
Promise = require 'bluebird'
prettyjson = require 'prettyjson'
_ = require 'underscore'
moment = require 'moment'

ec2 = new AWS.EC2({region:'us-west-2'})
Promise.promisifyAll(ec2)

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

Promise.all([
  ec2.describeInstancesAsync(),
  ec2.describeReservedInstancesAsync(),
]).spread (instances,reservedInstances)->
  reservedInstances = _.filter(reservedInstances["ReservedInstances"],(o)-> return o["State"] != "retired")
  reservedInstances = _.map(reservedInstances,(o)-> return _.pick(o,"InstanceType","AvailabilityZone","InstanceCount","State"))
  reservedInstancesReduced = _.reduce(reservedInstances,(memo,o)->
    r = _.find(memo,(i)-> return o["InstanceType"] == i["InstanceType"] and o["AvailabilityZone"] == i["AvailabilityZone"])
    if not r?
      r = _.clone(o)
      memo.push(r)
    else
      r["InstanceCount"] += o["InstanceCount"]
    return memo
  ,[])

  for reservedInstance in reservedInstancesReduced
    for reservation in instances["Reservations"]
      for instance in reservation["Instances"]
        console.log instance
        if instance["State"]["Name"] == "running" and instance["InstanceType"] == reservedInstance["InstanceType"] and instance["Placement"]["AvailabilityZone"] == reservedInstance["AvailabilityZone"]
          console.log "found running instance..."
          reservedInstance.runningCount ?= 0
          reservedInstance.runningCount += 1

  # console.log prettyjson.render(instances)
  # console.log prettyjson.render(instances)
  logAsTable(reservedInstancesReduced)
