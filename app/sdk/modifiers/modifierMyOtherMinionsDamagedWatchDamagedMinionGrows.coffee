ModifierMyOtherMinionsDamagedWatch = require './modifierMyOtherMinionsDamagedWatch'
ModifierGrow = require './modifierGrow'

class ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows extends ModifierMyOtherMinionsDamagedWatch

  type:"ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows"
  @type:"ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows"

  onDamageDealtToMinion: (action) ->

    minion = action.getTarget()
    if minion? and minion.hasActiveModifierClass(ModifierGrow)
      for mod in minion.getActiveModifiersByClass(ModifierGrow)
        mod.activateGrow() # activate each instance of Grow on the minion

module.exports = ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows
