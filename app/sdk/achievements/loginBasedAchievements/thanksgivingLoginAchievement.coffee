Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class ThanksgivingLoginAchievement extends Achievement
  @id: "thanksgivingLoginAchievement"
  @title: "HAPPY THANKSGIVING"
  @description: "WE'RE THANKFUL TODAY FOR OUR LOVING FANS, SO WE'RE GIVING BACK WITH A SPECIAL GIFT"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.ThanksgivingLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-11-16T11:00-08:00")) and currentLoginMoment.isBefore(moment.utc("2018-11-23T11:00-08:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-11-16T11:00-08:00")

module.exports = ThanksgivingLoginAchievement
