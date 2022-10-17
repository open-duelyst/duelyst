ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierTakeDamageWatchHealMyGeneral extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchHealMyGeneral"
  @type:"ModifierTakeDamageWatchHealMyGeneral"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this minion takes damage, restore %X Health to your General"

  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onDamageTaken: (action) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    if general?
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getCard().getOwnerId())
      healAction.setSource(@getCard())
      healAction.setTarget(general)
      healAction.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction)

module.exports = ModifierTakeDamageWatchHealMyGeneral
