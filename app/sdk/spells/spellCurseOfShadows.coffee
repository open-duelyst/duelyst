SpellKillTarget = require './spellKillTarget'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellCurseOfShadows extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    attack = unit.getATK()

    super(board,x,y,sourceAction)

    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(enemyGeneral)
    damageAction.setDamageAmount(attack)
    @getGameSession().executeAction(damageAction)

module.exports = SpellCurseOfShadows