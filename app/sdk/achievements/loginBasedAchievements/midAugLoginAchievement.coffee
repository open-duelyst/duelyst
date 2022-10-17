Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

class MidAugLoginAchievement extends Achievement
  @id: "midAugLoginAchievement"
  @title: "Thanks for playing Duelyst"
  @description: "Enjoy 3 Unearthed Prophecy Spirit Orbs on us for being a great community!"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.MidAugust2017Login]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2017-08-15")) and currentLoginMoment.isBefore(moment.utc("Thu Aug 31 2017 18:00:00 GMT+0000"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2017-08-15")

module.exports = MidAugLoginAchievement
