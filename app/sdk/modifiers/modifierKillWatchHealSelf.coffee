ModifierKillWatch = require './modifierKillWatch'
HealAction = require 'app/sdk/actions/healAction'

class ModifierKillWatchHealSelf extends ModifierKillWatch

  type:"ModifierKillWatchHealSelf"
  @type:"ModifierKillWatchHealSelf"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, includeAllies=true, includeGenerals=true, options) ->
    contextObject = super(includeAllies, includeGenerals, options)
    contextObject.healAmount = healAmount
    return contextObject

  onKillWatch: (action) ->
    healAction = @getCard().getGameSession().createActionForType(HealAction.type)
    healAction.setTarget(@getCard())
    healAction.setHealAmount(@healAmount)
    @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierKillWatchHealSelf
