Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

class Frostfire2017BonusLoginAchievement extends Achievement
  @id: "Frostfire2017BonusLoginAchievement"
  @title: "It's the most festive time of the season!"
  @description: "Here's 2 special Frostfire Loot Crates full of festive goodies."
  @progressRequired: 1
  @rewards:
    giftChests: [
      GiftCrateLookup.FrostfirePurchasable2017
      GiftCrateLookup.FrostfirePurchasable2017
    ]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2017-12-25")) and currentLoginMoment.isBefore(moment.utc("2018-01-04"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2017-12-25")

module.exports = Frostfire2017BonusLoginAchievement
