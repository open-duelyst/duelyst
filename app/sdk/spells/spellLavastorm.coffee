Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
SpellKillTarget = require('./spellKillTarget')
SpellFilterType = require './spellFilterType'

class SpellLavastorm extends SpellKillTarget

  @minAttackValue: 0
  spellFilterType: SpellFilterType.NeutralIndirect

  _findApplyEffectPositions: (position, sourceAction) ->
    potentialApplyEffectPositions = super(position, sourceAction)
    applyEffectPositions = []
    board = @getGameSession().getBoard()

    # apply to each unit with < minAttackValue attack
    for position in potentialApplyEffectPositions
      unit = board.getUnitAtPosition(position)
      if unit?.getATK() < @minAttackValue and !unit.getIsGeneral()
        applyEffectPositions.push(position)

    return applyEffectPositions

module.exports = SpellLavastorm
