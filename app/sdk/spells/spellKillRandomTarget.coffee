Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
KillAction = require 'app/sdk/actions/killAction'

class SpellKillRandomTarget extends Spell

  spellFilterType: SpellFilterType.None
  targetType: CardType.Unit
  numberToKill: 1

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}

    # only execute the damage on reapply
    # we'll find the random positions during reapply
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    killAction = new KillAction(@getGameSession())
    killAction.setOwnerId(@getOwnerId())
    killAction.setTarget(entity)
    @getGameSession().executeAction(killAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    randomApplyEffectPositions = []
    board = @getGameSession().getBoard()

    if sourceAction?
      applyEffectPositionsBase = super(position, sourceAction)
      applyEffectPositionsWithEntity = []

      # include position this was cast at
      applyEffectPositionsBase.push(position)

      # pick up to number to kill random positions from reapply positions
      for applyEffectPosition in applyEffectPositionsBase
        entity = board.getCardAtPosition(applyEffectPosition, @targetType)
        if entity? and (!entity.getIsGeneral() or @canTargetGeneral) and (@getTargetsNeutral() or (@getTargetsAllies() and entity.getOwnerId() == @getOwnerId()) or (@getTargetsEnemies() and entity.getOwnerId() != @getOwnerId()))
          applyEffectPositionsWithEntity.push(applyEffectPosition)

      killCount = 0
      while applyEffectPositionsWithEntity.length > 0
        index = @getGameSession().getRandomIntegerForExecution(applyEffectPositionsWithEntity.length)
        randomApplyEffectPositions.push(applyEffectPositionsWithEntity.splice(index, 1)[0])
        if ++killCount >= @numberToKill then break

    return randomApplyEffectPositions

module.exports = SpellKillRandomTarget
