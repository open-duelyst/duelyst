SpellRefreshExhaustion = require './spellRefreshExhaustion'
SpellFilterType = require './spellFilterType'

class SpellTimeMaelstrom extends SpellRefreshExhaustion

  spellFilterType: SpellFilterType.AllyIndirect
  canTargetGeneral: true

  _postFilterApplyPositions: (validPositions) ->
    ownGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    finalPositions = []
    for position in validPositions
      if @getGameSession().getBoard().getCardAtPosition(position) is ownGeneral
        finalPositions.push(position)
    return finalPositions


module.exports = SpellTimeMaelstrom
