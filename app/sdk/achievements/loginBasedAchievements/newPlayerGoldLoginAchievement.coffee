Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'

# This achievement exists so we can give new players a head start on their collection.
class NewPlayerGoldLoginAchievement extends Achievement
  @id: "newPlayerGoldLoginAchievement"
  @title: "Welcome to Duelyst!"
  @description: "Use Gold to buy Spirit Orbs."
  @progressRequired: 1
  @rewards:
    gold: 2500

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    return 1

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2022-10-28T00:00-00:00")

module.exports = NewPlayerGoldLoginAchievement
