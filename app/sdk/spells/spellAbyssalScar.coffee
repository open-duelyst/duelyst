SpellApplyModifiers = require './spellApplyModifiers'
DamageAction = require 'app/sdk/actions/damageAction'
_ = require 'underscore'

class SpellAbyssalScar extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(unit)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)
    @targetModifiersContextObjects[0].spawnOwnerId = @getOwnerId()
    super(board,x,y,sourceAction)

module.exports = SpellAbyssalScar
