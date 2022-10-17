SpellSpawnEntity = require './spellSpawnEntity'

class SpellSpawnEntitiesOnEdgeSpaces extends SpellSpawnEntity

  cardDataOrIndexToSpawn: null

  _findApplyEffectPositions: (position, sourceAction) ->

    applyEffectPositions = []

    for i in [0..8]
      applyEffectPositions.push({x: i, y: 0})
      applyEffectPositions.push({x: i, y: 4})

    for i in [1..3]
      applyEffectPositions.push({x: 0, y: i})
      applyEffectPositions.push({x: 8, y: i})

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellSpawnEntitiesOnEdgeSpaces