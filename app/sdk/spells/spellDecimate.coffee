Logger = require 'app/common/logger'
SpellKillTarget = require './spellKillTarget'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
_ = require 'underscore'

class SpellDecimate extends SpellKillTarget

  _postFilterApplyPositions: (validPositions) ->
    filteredPositions = []

    if validPositions.length > 0
      # spell only applies to units not nearby a general
      board = @getGameSession().getBoard()
      general1 = @getGameSession().getGeneralForPlayer1()
      general2 = @getGameSession().getGeneralForPlayer2()
      unitsAroundGenerals = _.uniq(_.union(board.getEntitiesAroundEntity(general1, @targetType, 1), board.getEntitiesAroundEntity(general2, @targetType, 1)))

      for position in validPositions
        validPosition = true
        for unit in unitsAroundGenerals
          if unit.position.x == position.x and unit.position.y == position.y
            validPosition = false
            break

        if validPosition then filteredPositions.push(position)

    return filteredPositions

module.exports = SpellDecimate
