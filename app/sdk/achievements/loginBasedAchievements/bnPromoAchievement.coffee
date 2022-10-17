Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

class BNPromoAchievement extends Achievement
  @id: "bnPromoAchievement"
  @title: "BANDAI NAMCO PARTNERSHIP EVENT"
  @description: "Here's a FREE GIFT CRATE to celebrate our new partnership!"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.BNLogin2017]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2017-07-03")) and currentLoginMoment.isBefore(moment.utc("2017-08-01"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2017-07-01 00:01")

module.exports = BNPromoAchievement
