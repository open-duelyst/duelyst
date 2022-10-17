ModifierDealDamageWatch = require './modifierDealDamageWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierDealDamageWatchHealMyGeneral extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchHealMyGeneral"
  @type:"ModifierDealDamageWatchHealMyGeneral"

  @modifierName:"Deal Damage Watch"
  @description:"Whenever this minion deals damage, restore %X Health to your General"

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onDealDamage: (action) ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

module.exports = ModifierDealDamageWatchHealMyGeneral
