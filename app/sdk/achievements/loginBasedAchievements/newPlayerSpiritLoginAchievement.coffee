Achievement = require 'app/sdk/achievements/achievement'
moment = require 'moment'

# This achievement exists so we can give new players a head start on their collection.
class NewPlayerSpiritLoginAchievement extends Achievement
  @id: "newPlayerSpiritLoginAchievement"
  @title: "Welcome to Duelyst!"
  @description: "Use Spirit to craft cards in the Collection menu."
  @progressRequired: 1
  @rewards:
    spirit: 50000

  @enabled: true

  @progressForLoggingIn: (currentLoginMoment) ->
    return 1

  @getLoginAchievementStartsMoment: () ->
    return moment.utc("2022-10-28T00:00-00:00")

module.exports = NewPlayerSpiritLoginAchievement
