SpellFollowupKillTarget = require './spellFollowupKillTarget'

class SpellFollowupKillTargetByAttack extends SpellFollowupKillTarget

  maxAttack: 0

  _postFilterPlayPositions: (validPositions) ->
    validPositions = super(validPositions)
    finalPositions = []
    board = @getGameSession().getBoard()
    for position in validPositions
      if board.getUnitAtPosition(position)?.getATK() <= @maxAttack
        finalPositions.push(position)

    return finalPositions

module.exports = SpellFollowupKillTargetByAttack
