express = require 'express'
router = express.Router()

util = require 'util'
Logger = require '../../app/common/logger'
generatePushId = require '../../app/common/generate_push_id'
_ = require 'underscore'
bcrypt = require 'bcrypt'
crypto = require 'crypto'
jwt = require 'jsonwebtoken'
expressJwt = require 'express-jwt'
Promise = require 'bluebird'
uuid = require 'node-uuid'
moment = require 'moment'
hashHelpers = require '../lib/hash_helpers'
DataAccessHelpers = require '../lib/data_access/helpers'
Errors = require '../lib/custom_errors'
isSignedIn = require '../middleware/signed_in'
t = require 'tcomb-validation'
validators = require '../validators'
types = require '../validators/types'
fetch = require 'isomorphic-fetch'
formurlencoded= require 'form-urlencoded'
knex = require '../lib/data_access/knex'

# our modules
UsersModule = require '../lib/data_access/users'
ReferralsModule = require '../lib/data_access/referrals'
InventoryModule = require '../lib/data_access/inventory'
SyncModule = require '../lib/data_access/sync'
AnalyticsUtil = require '../../app/common/analyticsUtil'

# Configuration object
config = require '../../config/config'
{version} = require '../../version'

###
Build analytics data from user data
###
analyticsDataFromUserData = (userRow) ->
  analyticsData = {}
  if userRow.campaign_source?
    analyticsData.campaign_source = userRow.campaign_source
  if userRow.campaign_medium?
    analyticsData.campaign_medium = userRow.campaign_medium
  if userRow.campaign_term?
    analyticsData.campaign_term = userRow.campaign_term
  if userRow.campaign_content?
    analyticsData.campaign_content = userRow.campaign_content
  if userRow.campaign_name?
    analyticsData.campaign_name = userRow.campaign_name
  if userRow.referrer?
    analyticsData.referrer = userRow.referrer
  if userRow.first_purchased_at?
    analyticsData.first_purchased_at = userRow.first_purchased_at
  if userRow.seen_on_days?
    AnalyticsUtil.convertDaysSeenOnFromArrayToObject(userRow.seen_on_days,analyticsData)
  if userRow.last_session_at?
    analyticsData.last_session_at = userRow.last_session_at
  return analyticsData

###
Log a user in (firing sync jobs) and generate a response (token)
Possibly add param in return data to say username is null? OR just allow client to decode token
###
logUserIn = (id) ->
  return UsersModule.userDataForId(id)
  .bind {}
  .then (data) ->
    if !data?
      throw new Errors.NotFoundError()

    if data.is_suspended
      throw new Errors.AccountDisabled("This account has been suspended. Reason: #{data.suspended_memo}")

    payload =
      d:
        id: id
        username: data.username || null
      v: 0
      iat: Math.floor(new Date().getTime() / 1000)
    options =
      expiresIn: config.get('jwt.tokenExpiration')
      algorithm: 'HS256'

    @token = jwt.sign(payload, config.get('firebase.legacyToken'), options)
    @analyticsData = analyticsDataFromUserData(data)
    return UsersModule.bumpSessionCountAndSyncDataIfNeeded(id, data)
  .then (synced) ->
    @synced = synced
    return UsersModule.createDaysSeenOnJob(id)
  .then () ->
    return {
      token: @token,
      synced: @synced,
      analytics_data: @analyticsData
    }

###
GET handler for session status
Validates current session used by user
Generates a fresh token by logging the user in
###
router.get "/session/", isSignedIn, (req, res, next) ->
  user_id = req.user.d.id

  return logUserIn(user_id)
  .bind {}
  .then (data) ->
    return res.status(200).json(data)
  .catch Errors.NotFoundError, (e) ->
    return res.status(401).json({})
  .catch Errors.AccountDisabled, (e) ->
    return res.status(401).json({message: e.message})
  .catch (e) ->
    next(e)

###
POST handler for session login
Log users in
###
router.post "/session/", (req, res, next) ->
  result = t.validate(req.body, validators.loginInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  username = result.value.username?.toLowerCase()
  password = result.value.password

  UsersModule.userIdForUsername(username)
  .bind {}
  .then (id) -> # Step 2 : check if user exists
    if !id
      throw new Errors.NotFoundError()

    @id = id
    return UsersModule.userDataForId(id)
  .then (data) -> # check password valid
    @.userRow = data
    if data.is_suspended
      throw new Errors.AccountDisabled("This account has been suspended. Reason: #{data.suspended_memo}")
    return hashHelpers.comparePassword(password, data.password)
  .then (match) ->
    if (!match)
      throw new Errors.BadPasswordError()
    else
      # Firebase expects payload with following items:
      # d: profile data encoded in token, becomes accessible by Firebase security rules
      # v: version number (0)
      # iat : issued at time in seconds since epoch
      payload =
        d:
          id: @id
          username: @.userRow.username
        v: 0
        iat: Math.floor(new Date().getTime() / 1000)

      # Token creation options are :
      # algorithm (default: HS256)
      # expiresInMinutes
      # audience
      # subject
      # issuer
      options =
        expiresIn: config.get('jwt.tokenExpiration')
        algorithm: 'HS256'

      # We are encoding the payload inside the token
      @.token = jwt.sign(payload, config.get('firebase.legacyToken'), options)

      # make a db transaction/ledger event for the login
      # UsersModule.logEvent(@id,"session","login")

      return UsersModule.bumpSessionCountAndSyncDataIfNeeded(@.id,@.userRow)
  .then ()->
    return UsersModule.createDaysSeenOnJob(@id)
  .then ()->
    analyticsData = analyticsDataFromUserData(@userRow)
    # Send token
    return res.status(200).json({token: @.token, analytics_data: analyticsData})
  .catch Errors.AccountDisabled, (e) ->
    return res.status(401).json({message: e.message})
  .catch Errors.NotFoundError, (e) ->
    return res.status(401).json({message: 'Invalid Username or Password'})
  .catch Errors.BadPasswordError, (e) ->
    return res.status(401).json({message: 'Invalid Username or Password'})
  .catch (e) -> next(e)

###
POST handler for registration
Register new users
###
router.post "/session/register", (req, res, next) ->
  result = t.validate(req.body, validators.signupInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  password = result.value.password
  username = result.value.username.toLowerCase()
  inviteCode = result.value.keycode?.trim()
  referralCode = result.value.referral_code?.trim()
  friendReferralCode = result.value.friend_referral_code?.trim()
  campaignData = result.value.campaign_data
  captcha = result.value.captcha
  registrationSource = if result.value.is_desktop then 'desktop' else 'web'

  UsersModule.isValidInviteCode(inviteCode)
  .bind {}
  .then (inviteCodeData) -> # captcha verification
    if captcha? and config.get('recaptcha.secret')
      return Promise.resolve(
        fetch "https://www.google.com/recaptcha/api/siteverify",
          method: 'POST'
          headers:
            'Accept': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded'
          body: formurlencoded({
            secret: config.get('recaptcha.secret')
            response: captcha
          })
      )
      .bind(@)
      .timeout(10000)
      .then (res) ->
        if res.ok
          return res.json()
        else
          throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
      .then (body) ->
        return Promise.resolve(body.success)
    else if config.get('recaptcha.enabled') == false
      return true
    else
      return false
  .then (isCaptchaVerified) ->
    if not isCaptchaVerified
      throw new Errors.UnverifiedCaptchaError("We could not verify the captcha (bot detection).")
    return UsersModule.createNewUser(username,password,inviteCode,referralCode,campaignData,registrationSource)
  .then (userId) ->
    # if we have a friend referral code just fire off async the job to link these two together
    if friendReferralCode?
      UsersModule.userIdForUsername(friendReferralCode)
      .then (referrerId)->
        if not referrerId?
          throw new Errors.NotFoundError("Referrer not found by username.")
        return ReferralsModule.markUserAsReferredByFriend(userId,referrerId)
      .catch (err)->
        Logger.module("Session").error "failed to mark #{userId} as referred by #{friendReferralCode}. error:#{err.message}".red
    # notify twitch alerts of conversion
    if campaignData?["campaign_id"] and campaignData?["campaign_medium"] == "openpromotion"
      Logger.module("Session").debug "twitch-alerts conversion. pinging: https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=...&campaign_id=#{campaignData["campaign_id"]}"
      Promise.resolve(fetch("https://promos.twitchalerts.com/webhook/conversion?advertiser_id=34&code=#{campaignData["campaign_source"]}&ip=#{req.ip}&api_key=2d82e8c0cf17467490467b0c77c6c08e&campaign_id=#{campaignData["campaign_id"]}"))
      .timeout(10000)
      .then (res) ->
        return res.json()
      .then (body) ->
        Logger.module("Session").debug "twitch-alerts response: ",body
      .catch (e) ->
        Logger.module("Session").error "twitch-alerts error processing: #{e.message}"
    # respond back to client
    return res.status(200).json({})
  .catch Errors.InvalidInviteCodeError, (e) ->  # Specific error if the invite code is invalid
    Logger.module("Session").error "can not register because invite code #{inviteCode?.yellow} is invalid".red
    return res.status(400).json(e)
  .catch Errors.InvalidReferralCodeError, (e) ->  # Specific error if the invite code is invalid
    Logger.module("Session").error "can not register because referral code #{referralCode?.yellow} is invalid".red
    return res.status(400).json(e)
  .catch Errors.AlreadyExistsError, (e) ->  # Specific error if the user already exists
    Logger.module("Session").error "can not register because username #{username?.blue} already exists".red
    return res.status(401).json(e)
  .catch Errors.UnverifiedCaptchaError, (e) ->  # Specific error if the captcha fails
    Logger.module("Session").error "can not register because captcha #{captcha} input is invalid".red
    return res.status(401).json(e)
  .catch (e) -> next(e)

###
POST handler for checking availability of username
###
router.post "/session/username_available", (req, res, next) ->
  result = t.validate(req.body.username, types.Username)
  if not result.isValid()
    return res.status(400).json(result.errors)

  username = result.value.toLowerCase()

  UsersModule.userIdForUsername(username)
  .then (id) ->
    if id
      throw new Errors.AlreadyExistsError("Username already exists")
    else
      return res.status(200).json({})
  .catch Errors.AlreadyExistsError, (e) ->
    return res.status(401).json(e)
  .catch (e) -> next(e)

###
POST handler for changing a username
###
router.post "/session/change_username", isSignedIn, (req, res, next) ->
  user_id = req.user.d.id
  result = t.validate(req.body.new_username, types.Username)
  if not result.isValid()
    return res.status(400).json(result.errors)

  new_username = result.value.toLowerCase()

  UsersModule.changeUsername(user_id,new_username)
  .then () ->
    return res.status(200).json({})
  .catch Errors.AlreadyExistsError, (e) ->  # Specific error if the username already exists
    Logger.module("Session").error "can not change username to #{new_username.blue} as it already exists".red
    return res.status(400).json(e)
  .catch Errors.InsufficientFundsError, (e) ->
    Logger.module("Session").error "can not change username to #{new_username.blue} due to insufficient funds".red
    return res.status(400).json(e)
  .catch (e) ->
    next(e)

###
POST handler for changing a password
###
router.post "/session/change_password", isSignedIn, (req, res, next) ->
  user_id = req.user.d.id
  result = t.validate(req.body, validators.changePasswordInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  current_password = result.value.current_password
  new_password = result.value.new_password

  UsersModule.changePassword(user_id, current_password, new_password)
  .then ()->
    return res.status(200).json({message: 'OK - password changed'})
  .catch Errors.BadPasswordError, (e) ->
    return res.status(401).json({})
  .catch (e) -> next(e)

###
GET handler for session logout
Invalidates current session used by user
###
router.get "/session/logout", isSignedIn, (req, res) ->
  return res.status(200).json({authenticated: false})

module.exports = router
