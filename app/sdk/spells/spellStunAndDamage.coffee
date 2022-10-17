SpellApplyModifiers = require './spellApplyModifiers'
DamageAction = require 'app/sdk/actions/damageAction'
_ = require 'underscore'

class SpellStunAndDamage extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    if unit?
      super(board,x,y,sourceAction)
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getOwnerId())
      damageAction.setTarget(unit)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = SpellStunAndDamage
