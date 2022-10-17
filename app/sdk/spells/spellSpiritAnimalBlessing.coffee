CONFIG = require 'app/common/config'
SpellRefreshExhaustion = require './spellRefreshExhaustion'
SpellFilterType = require './spellFilterType'

class SpellSpiritAnimalBlessing extends SpellRefreshExhaustion

  spellFilterType: SpellFilterType.AllyIndirect

  _postFilterApplyPositions: (validPositions) ->
    # spell kills units on 'your side' of the board
    if validPositions.length > 0

      # begin with "opponent's side" defined as whole board
      opponentSideStartX = 0
      opponentSideEndX = CONFIG.BOARDCOL

      filteredPositions = []

      if @isOwnedByPlayer2()
        opponentSideEndX = Math.floor((opponentSideEndX - opponentSideStartX) * 0.5 - 1)

      else if @isOwnedByPlayer1()
        opponentSideStartX = Math.floor((opponentSideEndX - opponentSideStartX) * 0.5 + 1)


      for position in validPositions
        if position.x >= opponentSideStartX and position.x <= opponentSideEndX
          filteredPositions.push(position)

    return filteredPositions

module.exports = SpellSpiritAnimalBlessing
