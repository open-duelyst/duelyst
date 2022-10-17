SpellKillTarget = require './spellKillTarget'
Races = require 'app/sdk/cards/racesLookup'

class SpellCircleOfDesiccation extends SpellKillTarget

  _findApplyEffectPositions: (position, sourceAction) ->
    potentialApplyEffectPositions = super(position, sourceAction)
    applyEffectPositions = []
    board = @getGameSession().getBoard()

    # apply to non-structures
    for position in potentialApplyEffectPositions
      unit = board.getUnitAtPosition(position)
      if !unit?.getBelongsToTribe(Races.Structure)
        applyEffectPositions.push(position)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellCircleOfDesiccation
