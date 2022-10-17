CONFIG = require 'app/common/config'
ModifierEndTurnWatch = require './modifierEndTurnWatch'
HealAction = require "app/sdk/actions/healAction"

class ModifierEndTurnWatchHealSelf extends ModifierEndTurnWatch

  type: "ModifierEndTurnWatchHealSelf"
  @type: "ModifierEndTurnWatchHealSelf"

  @modifierName: "End Turn Heal"
  @description: "Restore %X Health to this minion at the end of your turn"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onTurnWatch: () ->
    super()

    healAction1 = @getGameSession().createActionForType(HealAction.type)
    healAction1.setTarget(@getCard())
    healAction1.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction1)

module.exports = ModifierEndTurnWatchHealSelf
