Spell =   require('./spell')
CardType = require('app/sdk/cards/cardType')
SpellFilterType = require './spellFilterType'

###
  Abstract class that should be the super class for ANY spell that applies entities to the board.
###
class SpellApplyEntityToBoard extends Spell

  sourceType: CardType.Entity
  targetType: CardType.Entity
  spellFilterType: SpellFilterType.None
  filterPlayPositionsForEntity: true # by default SpellApplyEntity blocks play positions where the spawning entity would be obstructed

  getEntityToSpawn: () ->
    # override in subclasses and provide entity that will be applied to board
    return null

  _postFilterPlayPositions: (validPositions) ->
    if @filterPlayPositionsForEntity
      entity = @getEntityToSpawn()
      if entity?
        filteredPositions = []
        for position in validPositions
          if !@getGameSession().getBoard().getObstructionAtPositionForEntity(position, entity)
            filteredPositions.push(position)
        return filteredPositions
      else
        return super(validPositions)
    else
      return super(validPositions)

module.exports = SpellApplyEntityToBoard
