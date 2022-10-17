CONFIG = require 'app/common/config'
SpellApplyModifiers = require './spellApplyModifiers'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'

class SpellLightningBlitz extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    unit = board.getCardAtPosition(applyEffectPosition, @targetType)
    if unit?
      randomTeleportAction = new RandomTeleportAction(@getGameSession())
      randomTeleportAction.setOwnerId(@getOwnerId())
      randomTeleportAction.setSource(unit)
      if unit.isOwnedByPlayer1() # if owned by player 1, we want to teleport onto player 2s side
        randomTeleportAction.setPatternSourcePosition({x: Math.ceil(CONFIG.BOARDCOL * 0.5), y:0})
      else if unit.isOwnedByPlayer2() # if owned by player 2, we want to teleport onto player 1s side
        randomTeleportAction.setPatternSourcePosition({x:0, y:0})
      randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_HALF_BOARD)
      @getGameSession().executeAction(randomTeleportAction)

module.exports = SpellLightningBlitz
