Promise = require 'bluebird'
generatePushId = require './../../app/common/generate_push_id'
Errors = require './custom_errors'
Logger = require '../../app/common/logger'

###*
# Requests a 'once' query on a firebase location.
# @public
# @static
# @param  {Firebase}  ref      Reference to firebase location on which to execute query
# @param  {String}  eventName  One of the following strings: "value", "child_added", "child_changed", "child_removed", or "child_moved."
# @return  {Promise}        Promise that will resolve with the Firebase snapshot, or reject with an error if the query fails.
###
module.exports.once = (ref,eventName) ->
  return new Promise (resolve, reject) ->
    onLoaded = (snapshot) ->
      resolve(snapshot)
    onError = (err) ->
      reject(err)
    ref.once(eventName, onLoaded, onError)


###*
# Sets data to a firebase location.
# @public
# @static
# @param  {Firebase}  ref      Reference to firebase location on which to run operation
# @param  {Object}  value    The data to write to this location.
# @return  {Promise}        Promise that will resolve with the value written, or reject with an error if the operation fails.
###
module.exports.set = (ref, value) ->

  # console.log("FIREBASE::set",ref.toString())

  return new Promise (resolve, reject) ->
    ref.set value, (err) ->
      if err
        reject(new Error("Firebase.set error " + err.message))
      else
        resolve(value)

###*
# Sets data to a firebase location with a priority for ordering.
# @public
# @static
# @param  {Firebase}        ref      Reference to firebase location on which to run operation
# @param  {Object}        value    The data to write to this location.
# @param  {String or Number}    priority  The priority (order index) for this location.
# @return  {Promise}              Promise that will resolve with the value written, or reject with an error if the operation fails.
###
module.exports.setWithPriority = (ref, value, priority) ->

  # console.log("FIREBASE::setWithPriority",ref.toString())

  return new Promise (resolve, reject) ->
    ref.setWithPriority value, priority, (err) ->
      if err
        reject(new Error("Firebase.setWithPriority error " + err.message))
      else
        resolve(value)

###*
# Update data on a firebase location without touching other data at the same location
# @public
# @static
# @param  {Firebase}        ref      Reference to firebase location on which to run operation
# @param  {Object}        value    The key/value map of data to write to this location.
# @return  {Promise}              Promise that will resolve with the value written, or reject with an error if the operation fails.
###
module.exports.update = (ref, value) ->

  # console.log("FIREBASE::update",ref.toString())

  return new Promise (resolve, reject) ->
    ref.update value, (err) ->
      if err
        reject(new Error("Firebase.update error " + err.message))
      else
        resolve(value)

###*
# Push data on to a firebase location without touching other data at the same location
# @public
# @static
# @param  {Firebase}        ref      Reference to firebase location on which to run operation
# @param  {Object}        value    The data to push to this location.
# @return  {Promise}              Promise that will resolve with a firebase reference to the location of the push, or reject with an error if the operation fails.
###
module.exports.push = (ref, value) ->
  return new Promise (resolve, reject) ->
    pushedRef = ref.push value, (err) ->
      if err
        reject(new Error("Firebase.push error " + err.message))
      else
        resolve(pushedRef)

###*
# Delete data on a firebase location.
# @public
# @static
# @param  {Firebase}        ref      Reference to firebase location on which to run operation
# @return  {Promise}              Promise that will resolve if operation succeeds, or reject with an error if the operation fails.
###
module.exports.remove = (ref, value) ->

  # console.log("FIREBASE::remove",ref.toString())

  return new Promise (resolve, reject) ->
    ref.remove (err) ->
      if err
        reject(new Error("Firebase.remove error " + err.message))
      else
        resolve(value)

###*
# Execute a custom reliable transaction on a firebase location to update data.
# @public
# @static
# @param  {Firebase}  ref      Reference to firebase location on which to execute transaction
# @param  {Function}  updateFn  Function that transforms the data, returns undefined to
# @return  {Promise}        Promise that will resolve with the Firebase snapshot, or reject with an error if the transaction fails.
###
module.exports.safeTransaction = (ref,updateFn) ->

  # console.log("FIREBASE::safeTransaction",ref.toString())

  if not ref?
    return Promise.reject(new Error("firebase ref is null or not defined"))

  if not updateFn?
    return Promise.reject(new Error("transaction updateFn is null or not defined"))

  return new Promise (resolve,reject)->

    # generate a lexically increasing transaction id
    tx_id = generatePushId()
    innerError = null
    Logger.module("FB").time("Firebase transaction for /#{ref} (#{tx_id})")

    txUpdateData = (data)->

      innerError = null
      # clone the data so if the update function modifies it it before failing it doesn't write half modified data back
      dataIn = JSON.parse(JSON.stringify(data))
      # update data
      try
        updatedData = updateFn(dataIn)
        if (updatedData instanceof Error)
          innerError = updatedData
      catch err
        innerError = err

      # if transaction does not return undefined
      if (!innerError && typeof updatedData != "undefined")
        # replace data var
        data = updatedData
        # mark with transaction id
        if data?
          data.tx_id = tx_id

      return data

    onTxUpdateComplete = (error,committed,snapshot)->
      Logger.module("FB").timeEnd("Firebase transaction for /#{ref} (#{tx_id})")
      if error
        reject(error)
      else if committed and snapshot.val()?.tx_id == tx_id
        resolve(snapshot)
      else if committed
        reject(innerError || new Errors.FirebaseTransactionDidNotCommitError("transaction ID indicates a failed update"))
      else
        reject(new Errors.FirebaseTransactionDidNotCommitError())


    ref.transaction(txUpdateData,onTxUpdateComplete)
