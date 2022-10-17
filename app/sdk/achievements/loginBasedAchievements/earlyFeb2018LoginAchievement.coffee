Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class EarlyFeb2018LoginAchievement extends Achievement
  @id: "earlyFeb2018LoginAchievement"
  @title: i18next.t("achievements.early_feb_2018_login_achievement_title")
  @description: i18next.t("achievements.early_feb_2018_login_achievement_desc")
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.EarlyFebruary2018Login]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-01-29")) and currentLoginMoment.isBefore(moment.utc("2018-03-01"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-01-29")

module.exports = EarlyFeb2018LoginAchievement
