Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class FathersDayLoginAchievement extends Achievement
  @id: "fathersDayLoginAchievement"
  @title: "HAPPY FATHER'S DAY"
  @description: "HERE'S 3 SHIM'ZAR ORBS TO CELEBRATE"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.FathersDayLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-06-15T11:00-07:00")) and currentLoginMoment.isBefore(moment.utc("2018-06-22T11:00-07:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-06-15T11:00-07:00")

module.exports = FathersDayLoginAchievement
