SpellFollowupTeleportMyGeneral =  require './spellFollowupTeleportMyGeneral'

class SpellFollowupTeleportMyGeneralBehindEnemy extends SpellFollowupTeleportMyGeneral

  getFollowupSourcePattern: () ->
    board = @getGameSession().getBoard()
    behindPositions = []
    # apply behind each enemy unit and General
    playerOffset = 0
    if @isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
    entity = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    for unit in board.getUnits()
      #look for units owned by the opponent of the player who cast the spell, and with an open space "behind" the enemy unit
      behindPosition = {x:unit.getPosition().x+playerOffset, y:unit.getPosition().y}
      if unit.getOwnerId() != @getOwnerId() and board.isOnBoard(behindPosition) and !board.getObstructionAtPositionForEntity(behindPosition, entity)
        behindPositions.push(behindPosition)

    patternBehindEnemies = []
    for position in behindPositions
      patternBehindEnemies.push({x: position.x - @getFollowupSourcePosition().x, y: position.y - @getFollowupSourcePosition().y})

    return patternBehindEnemies

  getTeleportSourcePosition: (applyEffectPosition) ->
    return @getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()

module.exports = SpellFollowupTeleportMyGeneralBehindEnemy
