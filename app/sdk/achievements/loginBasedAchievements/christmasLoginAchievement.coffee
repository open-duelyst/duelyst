Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class ChristmasLoginAchievement extends Achievement
  @id: "christmasLoginAchievement"
  @title: "HAPPY WINTER HOLIDAYS"
  @description: "ALL THE SNOWCHASERS HAVE GONE OUT TO PLAY, SO TAKE THESE GIFTS TO CELEBRATE THIS SPECIAL DAY"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.ChristmasLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-12-21T11:00-08:00")) and currentLoginMoment.isBefore(moment.utc("2018-12-28T11:00-08:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-12-21T11:00-08:00")

module.exports = ChristmasLoginAchievement
