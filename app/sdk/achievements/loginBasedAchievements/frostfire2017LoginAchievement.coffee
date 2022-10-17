Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

class Frostfire2017LoginAchievement extends Achievement
  @id: "frostfire2017LoginAchievement"
  @title: "Frostfire Festival Has Arrived!"
  @description: "Here's a special Frostfire Loot Crate full of festive goodies."
  @progressRequired: 1
  @rewards:
    giftChests: [
      GiftCrateLookup.FrostfirePurchasable2017
    ]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2017-11-29")) and currentLoginMoment.isBefore(moment.utc("2017-12-22"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2017-11-29")

module.exports = Frostfire2017LoginAchievement
