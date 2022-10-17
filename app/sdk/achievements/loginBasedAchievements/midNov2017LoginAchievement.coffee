Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

class MidNov2017LoginAchievement extends Achievement
  @id: "midNov2017LoginAchievement"
  @title: "Immortal Vanguard Expansion Launch"
  @description: "Enjoy 3 Immortal Vanguard Spirit Orbs to kickstart your collection!"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.MidNovember2017Login]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2017-11-09")) and currentLoginMoment.isBefore(moment.utc("2017-11-28"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2017-11-09")

module.exports = MidNov2017LoginAchievement
