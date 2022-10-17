SpellApplyModifiers = require './spellApplyModifiers'
CONFIG = require 'app/common/config'

class SpellWailingOverdrive extends SpellApplyModifiers

  _postFilterPlayPositions: (validPositions) ->
    infiltratedPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and @getIsInfiltratedPosition(unit.getPosition())
        infiltratedPositions.push(position)

    return infiltratedPositions

  getIsInfiltratedPosition: (position) ->
    # infiltrate is active when this entity is on the enemy side of the battlefield (determined by player starting side)

    # begin with "my side" defined as whole board
    enemySideStartX = 0
    enemySideEndX = CONFIG.BOARDCOL

    if @isOwnedByPlayer1()
      enemySideStartX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 + 1)
    else if @isOwnedByPlayer2()
      enemySideEndX = Math.floor((enemySideEndX - enemySideStartX) * 0.5 - 1)

    x = position.x
    return x >= enemySideStartX and x <= enemySideEndX


module.exports = SpellWailingOverdrive
