Spell = require './spell'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellSunstrike extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    applyEffectPosition = {x: x, y: y}
    entityAtPosition = @getGameSession().getBoard().getEntityAtPosition(applyEffectPosition)

    if entityAtPosition?
      if entityAtPosition.getOwnerId() is @getOwnerId()
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getOwnerId())
        healAction.setTarget(entityAtPosition)
        healAction.setHealAmount(3)
        @getGameSession().executeAction(healAction)
      else
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getOwnerId())
        damageAction.setSource(@)
        damageAction.setTarget(entityAtPosition)
        damageAction.setDamageAmount(3)
        @getGameSession().executeAction(damageAction)

module.exports = SpellSunstrike
