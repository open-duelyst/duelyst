SpellKillTarget = require './spellKillTarget'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellSacrificeBBS extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    super(board,x,y,sourceAction)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    damageAction = new DamageAction(this.getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(general)
    damageAction.setDamageAmount(2)
    @getGameSession().executeAction(damageAction)

    return true

module.exports = SpellSacrificeBBS