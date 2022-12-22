Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'

# This achievement exists so we can give new players a head start on their collection.
class NewPlayerCardsLoginAchievement extends Achievement
  @id: "newPlayerCardsLoginAchievement"
  @title: "Welcome to Duelyst!"
  @description: "Open this crate to receive a complete card collection! If the client freezes, reload the page."
  @progressRequired: 1
  @rewards:
    giftChests: [GiftCrateLookup.FullCollection]

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    return 1

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2022-10-28T00:00-00:00")

module.exports = NewPlayerCardsLoginAchievement
