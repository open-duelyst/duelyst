SpellSpawnEntity = require './spellSpawnEntity'

class SpellSpawnEntitiesOnGeneralsDiagonals extends SpellSpawnEntity

  cardDataOrIndexToSpawn: null

  _findApplyEffectPositions: (position, sourceAction) ->

    applyEffectPositions = []

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    generalPosition = general.getPosition()
    upLeftPosition = {x: generalPosition.x - 1, y: generalPosition.y + 1}
    downLeftPosition = {x: generalPosition.x - 1, y: generalPosition.y - 1}
    upRightPosition = {x: generalPosition.x + 1, y: generalPosition.y + 1}
    downRightPosition = {x: generalPosition.x + 1, y: generalPosition.y - 1}

    if upLeftPosition.x >= 0 and upLeftPosition.y <= 4
      applyEffectPositions.push(upLeftPosition)
    if downLeftPosition.x >= 0 and downLeftPosition.y >= 0
      applyEffectPositions.push(downLeftPosition)
    if upRightPosition.x <= 8 and upRightPosition.y <= 4
      applyEffectPositions.push(upRightPosition)
    if downRightPosition.x <= 8 and downRightPosition.y >= 0
      applyEffectPositions.push(downRightPosition)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellSpawnEntitiesOnGeneralsDiagonals