Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
i18next = require('i18next')

class CoreshatterLoginAchievement extends Achievement
  @id: "coreshatterLoginAchievement"
  @title: "Trials of Mythron Expansion Launch"
  @description: "Enjoy 3 Trials of Mythron Spirit Orbs to kickstart your collection!"
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.CoreshatterLogin]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    if currentLoginMoment != null && currentLoginMoment.isAfter(moment.utc("2018-03-14")) and currentLoginMoment.isBefore(moment.utc("2018-04-30"))
      return 1
    else
      return 0

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2018-03-14")

module.exports = CoreshatterLoginAchievement
