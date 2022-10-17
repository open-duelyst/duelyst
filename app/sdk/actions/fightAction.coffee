Action = require './action'
DamageAsAttackAction = require './damageAsAttackAction'

class FightAction extends Action

  @type:"FightAction"

  constructor: (gameSession) ->
    @type ?= FightAction.type
    super(gameSession)

  _execute: () ->

    source = @getSource()
    target = @getTarget()

    damageAction1 = new DamageAsAttackAction(@getGameSession())
    damageAction1.setOwnerId(source.getOwnerId())
    damageAction1.setSource(source)
    damageAction1.setTarget(target)
    damageAction1.setDamageAmount(source.getATK())
    @getGameSession().executeAction(damageAction1)

    damageAction2 = new DamageAsAttackAction(@getGameSession())
    damageAction2.setOwnerId(target.getOwnerId())
    damageAction2.setSource(target)
    damageAction2.setTarget(source)
    damageAction2.setDamageAmount(target.getATK())
    @getGameSession().executeAction(damageAction2)

module.exports = FightAction
