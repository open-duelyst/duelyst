ModifierMyAttackMinionWatch = require './modifierMyAttackMinionWatch'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierMyAttackMinionWatchStealGeneralHealth extends ModifierMyAttackMinionWatch

  type:"ModifierMyAttackMinionWatchStealGeneralHealth"
  @type:"ModifierMyAttackMinionWatchStealGeneralHealth"

  stealAmount: 0

  @createContextObject: (stealAmount=0, options) ->
    contextObject = super(options)
    contextObject.stealAmount = stealAmount
    return contextObject

  onMyAttackMinionWatch: (action) ->

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@stealAmount)
    @getGameSession().executeAction(healAction)

    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(enemyGeneral)
    damageAction.setDamageAmount(@stealAmount)
    @getGameSession().executeAction(damageAction)


module.exports = ModifierMyAttackMinionWatchStealGeneralHealth
