SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class SpellChargeIntoBattle extends SpellApplyModifiers

  _postFilterPlayPositions: (validPositions) ->
    # use super filter play positions
    validPositions = super(validPositions)
    filteredValidPositions = []

    # find unit that is behind the general
    generalPosition = @getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()
    if @getGameSession().getGeneralForPlayerId(@getOwnerId()).isOwnedByPlayer1()
      player1 = true
    else
      player1 = false

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if player1 and unit?.getPosition().x == generalPosition.x-1 and unit.getPosition().y == generalPosition.y
        filteredValidPositions.push(unit.getPosition())
      if !player1 and unit?.getPosition().x == generalPosition.x+1 and unit.getPosition().y == generalPosition.y
        filteredValidPositions.push(unit.getPosition())

    return filteredValidPositions

module.exports = SpellChargeIntoBattle
