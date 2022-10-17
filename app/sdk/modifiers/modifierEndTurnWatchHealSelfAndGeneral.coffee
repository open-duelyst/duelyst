CONFIG = require 'app/common/config'
ModifierEndTurnWatch = require './modifierEndTurnWatch'
HealAction = require "app/sdk/actions/healAction"

class ModifierEndTurnWatchHealSelfAndGeneral extends ModifierEndTurnWatch

  type: "ModifierEndTurnWatchHealSelfAndGeneral"
  @type: "ModifierEndTurnWatchHealSelfAndGeneral"

  @modifierName: "End Turn Heal"
  @description: "Restore %X Health to this minion and your General at the end of your turn"

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

    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if myGeneral?
      healAction2 = new HealAction(@getGameSession())
      healAction2.setOwnerId(@getCard().getOwnerId())
      healAction2.setTarget(myGeneral)
      healAction2.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction2)

module.exports = ModifierEndTurnWatchHealSelfAndGeneral
