Spell = require './spell'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'
_ = require 'underscore'

class SpellFriendlyJux extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    target = board.getUnitAtPosition(applyEffectPosition)

    swapAction = new SwapUnitsAction(@getGameSession())
    swapAction.setOwnerId(@getOwnerId())
    swapAction.setSource(general)
    swapAction.setTarget(target)
    swapAction.setFXResource(_.union(swapAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(swapAction)

module.exports = SpellFriendlyJux
