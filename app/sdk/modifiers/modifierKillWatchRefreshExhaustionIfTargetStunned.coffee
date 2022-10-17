ModifierKillWatchRefreshExhaustion = require './modifierKillWatchRefreshExhaustion'
ModifierStunned = require './modifierStunned'

class ModifierKillWatchRefreshExhaustionIfTargetStunned extends ModifierKillWatchRefreshExhaustion

  type:"ModifierKillWatchRefreshExhaustionIfTargetStunned"
  @type:"ModifierKillWatchRefreshExhaustionIfTargetStunned"

  fxResource: ["FX.Modifiers.ModifierKillWatch"]

  onKillWatch: (action) ->

    target = action.getTarget()
    if target? and target.hasActiveModifierClass(ModifierStunned)
      super()

module.exports = ModifierKillWatchRefreshExhaustionIfTargetStunned
