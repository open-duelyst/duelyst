Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class FourthOfJulyLoginAchievement extends Achievement
  @id: "fourthOfJulyLoginAchievement"
  @title: "4TH OF JULY CELEBRATION"
  @description: "HERE'S 3 ANCIENT ORBS TO CELEBRATE"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.FourthOfJulyLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-06-29T11:00-07:00")) and currentLoginMoment.isBefore(moment.utc("2018-07-06T11:00-07:00"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-06-29T11:00-07:00")

module.exports = FourthOfJulyLoginAchievement
