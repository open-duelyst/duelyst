ModifierKillWatch = require './modifierKillWatch'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'

class ModifierKillWatchRefreshExhaustion extends ModifierKillWatch

  type:"ModifierKillWatchRefreshExhaustion"
  @type:"ModifierKillWatchRefreshExhaustion"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericHeal"]

  onKillWatch: (action) ->
    refreshExhaustionAction = @getGameSession().createActionForType(RefreshExhaustionAction.type)
    refreshExhaustionAction.setSource(@getCard())
    refreshExhaustionAction.setTarget(@getCard())
    @getGameSession().executeAction(refreshExhaustionAction)

module.exports = ModifierKillWatchRefreshExhaustion
