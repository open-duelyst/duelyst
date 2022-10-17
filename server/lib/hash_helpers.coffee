###
# A small helper module for hash generation and compares
# Uses Bluebird to promisify the bcrypt modules
# Methods are both node style callback and promise compatible
# @module hash_helpers
###

Promise = require 'bluebird'
bcrypt = require 'bcrypt'

### This call wraps the bcrypt module in a Promise compatible interface ###
Promise.promisifyAll(bcrypt)

###*
# Generate a salt and hash using bcrypt when provided with a password
# .nodeify(callback) makes this function both callback and promise compatible
# @public
# @param  {String}  password        A password to hash
# @param  {Function}  [callback]        Optional callback(err,hash)
# @return  {Promise}              Promise returning hash
###
module.exports.generateHash = (password, callback) ->
  return bcrypt.genSaltAsync(10).then((salt) ->
    return bcrypt.hashAsync(password,salt).nodeify(callback)
  )

###*
# Compare a password against a bcrypt hash
# .nodeify(callback) makes this function both callback and promise compatible
# @public
# @param  {String}  password        Password
# @param  {String}  hash          Hash to compare to
# @param  {Function}  [callback]        Optional callback(err,match)
# @return  {Promise}              Promise returning true/false
###
module.exports.comparePassword = (password, hash, callback) ->
  return bcrypt.compareAsync(password,hash).nodeify(callback)
