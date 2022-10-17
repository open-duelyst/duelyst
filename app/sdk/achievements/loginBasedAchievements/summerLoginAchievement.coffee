Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class SummerLoginAchievement extends Achievement
  @id: "summerLoginAchievement"
  @title: "SUMMER TIME CELEBRATION"
  @description: "HERE'S 3 UNEARTHED ORBS TO CELEBRATE"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.SummerLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-08-03T11:00-07:00")) and currentLoginMoment.isBefore(moment.utc("2018-08-10T11:00-07:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-08-03T11:00-07:00")

module.exports = SummerLoginAchievement
