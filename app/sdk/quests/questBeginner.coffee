Quest = require './quest'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'

class QuestBeginner extends Quest
  # TODO: needs documentation
  isReplaceable:false
  isRequired:true
  isBeginner:true

  # Set the default Gold reward for quests.
  goldReward: 150

  constructor:()->
    super
    if Math.floor(@id / 100) != 99
      throw new Error("Invalid Beginner Quest ID")

module.exports = QuestBeginner
