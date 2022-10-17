_ = require 'underscore'

class RiftHelper

  # Returns the current level for a given total number of points
  @levelForPoints: (points)->
    totalRequired = 10
    level = 1
    for i in [2..1000]
      if points < totalRequired
        return level
      else
        totalRequired += i * 10
        level = i
    return level

  # Returns the number of points a player must reach to get to the the level passed in.
  # E.G. If a play is level 5 and you want to know how many points they need to level up, call pointsRequiredForLevel(6)
  @pointsRequiredForLevel: (level)->
    return (level-1) * 10

  # Returns the base number of points a player has when at a level
  @totalPointsForLevel: (level)->
    total = 0
    for i in [1..level]
      total += RiftHelper.pointsRequiredForLevel(i)
    return total

  # Returns 0 to 1 giving a percentage of progress a player has in their current level towards the next level
  @progressTowardsNextLevel: (points)->
    currentLevel = RiftHelper.levelForPoints(points)
    pointProgress = points - RiftHelper.totalPointsForLevel(currentLevel)
    return pointProgress / RiftHelper.pointsRequiredForLevel(currentLevel)

  @spiritCostForNextReroll: (currentUpgradeRerollCount, runTotalRerollCount) ->
#    linearValue = ((runTotalRerollCount + 1) * 25) + ((currentUpgradeRerollCount + 1) * 25)
#    minnedValue = Math.min(500,linearValue)
#    return minnedValue
    expValue = 25 * Math.pow(2,currentUpgradeRerollCount)
    return expValue


module.exports = RiftHelper
