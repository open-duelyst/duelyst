CONFIG = require 'app/common/config'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierMyGeneralDamagedWatchHealSelf extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchHealSelf"
  @type:"ModifierMyGeneralDamagedWatchHealSelf"

  @modifierName:"My General Damage Watch Heal Self"
  @description:"Whenever your General takes damage, %X"

  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierMyGeneralDamagedWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject.healAmount > 0
      return @description.replace /%X/, "restore "+modifierContextObject.healAmount+" Health to this minion"
    else
      return @description.replace /%X/, "fully heal this minion"

  onDamageDealtToGeneral: (action) ->
    if @getCard().getHP() < @getCard().getMaxHP()
      healAction = @getCard().getGameSession().createActionForType(HealAction.type)
      healAction.setTarget(@getCard())
      if @healAmount == 0 # default, heal to full
        healAction.setHealAmount(@getCard().getMaxHP() - @getCard().getHP())
      else
        healAction.setHealAmount(@healAmount)
      @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierMyGeneralDamagedWatchHealSelf
