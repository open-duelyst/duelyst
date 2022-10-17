Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class LaborDayLoginAchievement extends Achievement
  @id: "laborDayLoginAchievement"
  @title: "HAPPY LABOR DAY"
  @description: "HERE'S 3 IMMORTAL ORBS TO CELEBRATE"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.LaborDayLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-08-31T11:00-07:00")) and currentLoginMoment.isBefore(moment.utc("2018-09-07T11:00-07:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-08-31T11:00-07:00")

module.exports = LaborDayLoginAchievement
