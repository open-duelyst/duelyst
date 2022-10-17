_ = require 'underscore'
moment = require 'moment'


class AnalyticsUtil
  @RecordedDaysSeenOn: [1,3,7,15,30,60]

  ###*
  # Converts representation of the days a user was seen on from an array to an object
  # @public
  # @param  {Array}        daysSeenOn  User ID for which to update.
  # @param  {Object}      dataTarget  (optional) An object to set the values on to
  # @return  {Object}  Either dataTarget passed in or a new object with days seen on recorded as named key values
  ###
  @convertDaysSeenOnFromArrayToObject:(daysSeenOn,dataTarget)->
    if not dataTarget?
      dataTarget = {}

    for recordedDayIndex in @.RecordedDaysSeenOn
      if _.contains(daysSeenOn,recordedDayIndex)
        dataTarget[@.nameForSeenOnDay(recordedDayIndex)] = 1

    return dataTarget

  ###*
  # Given two moments returns the registered cohort day this represents, if one exists
  # @public
  # @param  {Moment}  registrationMoment  moment object representing when a user registered
  # @param  {Moment}  seenOnMoment        moment object representing time user was seen
  # @return  {Integer||Null}  Either the integer value for the recorded day or null
  ###
  @recordedDayIndexForRegistrationAndSeenOn:(registrationMoment,seenOnMoment)->
    daysSinceRegistration = seenOnMoment.clone().diff(registrationMoment.clone(),'days')

    isRecordedDay = _.contains(@.RecordedDaysSeenOn,daysSinceRegistration)

    if isRecordedDay
      return daysSinceRegistration
    else
      return null

  @nameForSeenOnDay:(dayIndex)->
    return "seen_on_d" + dayIndex


module.exports = AnalyticsUtil
