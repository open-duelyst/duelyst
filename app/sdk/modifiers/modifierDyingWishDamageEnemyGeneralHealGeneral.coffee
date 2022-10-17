ModifierDyingWish = require './modifierDyingWish'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

CONFIG = require 'app/common/config'

class ModifierDyingWishDamageEnemyGeneralHealGeneral extends ModifierDyingWish

  type:"ModifierDyingWishDamageEnemyGeneralHealGeneral"
  @type:"ModifierDyingWishDamageEnemyGeneralHealGeneral"

  @description: "Deal %X damage to the enemy General. Restore %X Health to your General"

  healthChangeAmount: 0

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericChain"]

  @createContextObject: (healthChangeAmount=0) ->
    contextObject = super()
    contextObject.healthChangeAmount = healthChangeAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/g, () ->
        modifierContextObject.healthChangeAmount
    else
      return @description

  onDyingWish: () ->
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    if enemyGeneral?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setTarget(enemyGeneral)
      damageAction.setDamageAmount(@healthChangeAmount)
      @getGameSession().executeAction(damageAction)

    if myGeneral?
      healAction = new HealAction(this.getGameSession())
      healAction.setOwnerId(@getCard().getOwnerId())
      healAction.setTarget(myGeneral)
      healAction.setHealAmount(@healthChangeAmount)
      @getGameSession().executeAction(healAction)

module.exports = ModifierDyingWishDamageEnemyGeneralHealGeneral
