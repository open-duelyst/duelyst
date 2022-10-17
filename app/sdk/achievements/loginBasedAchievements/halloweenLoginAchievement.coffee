Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class HalloweenLoginAchievement extends Achievement
  @id: "halloweenLoginAchievement"
  @title: "HAPPY HALLOWEEN"
  @description: "HERE'S 3 MYTHRON TREATS TO CELEBRATE"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.HalloweenLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-10-26T11:00-07:00")) and currentLoginMoment.isBefore(moment.utc("2018-11-02T11:00-07:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-10-26T11:00-07:00")

module.exports = HalloweenLoginAchievement
