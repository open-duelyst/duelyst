ModifierMyMinionAttackWatch = require './modifierMyMinionAttackWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierMyMinionAttackWatchHealGeneral extends ModifierMyMinionAttackWatch

  type:"ModifierMyMinionAttackWatchHealGeneral"
  @type:"ModifierMyMinionAttackWatchHealGeneral"

  @modifierName:"MyMinionAttackWatch Heal My General"
  @description:"Whenever a friendly minion attacks, restore %X Health to your General"

  fxResource: ["FX.Modifiers.ModifierMyMinionAttackWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onMyMinionAttackWatch: (action) ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

module.exports = ModifierMyMinionAttackWatchHealGeneral
