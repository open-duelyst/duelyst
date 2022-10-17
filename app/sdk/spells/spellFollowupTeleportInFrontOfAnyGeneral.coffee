SpellFollowupTeleport = require './spellFollowupTeleport'

class SpellFollowupTeleportInFrontOfAnyGeneral extends SpellFollowupTeleport

  getFollowupSourcePattern: () ->
    board = @getGameSession().getBoard()
    inFrontOfPositions = []
    for unit in board.getUnits()
      # apply in front of any General
      playerOffset = 0
      if unit.getIsGeneral()
        if unit.isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
        entity = @getGameSession().getGeneralForPlayerId(@getOwnerId())
        inFrontOfPosition = {x:unit.getPosition().x+playerOffset, y:unit.getPosition().y}
        if board.isOnBoard(inFrontOfPosition) and !board.getObstructionAtPositionForEntity(inFrontOfPosition, entity)
          inFrontOfPositions.push(inFrontOfPosition)

    paternInFrontOfGenerals = []
    for position in inFrontOfPositions
      paternInFrontOfGenerals.push({x: position.x - @getFollowupSourcePosition().x, y: position.y - @getFollowupSourcePosition().y})

    return paternInFrontOfGenerals

module.exports = SpellFollowupTeleportInFrontOfAnyGeneral
