CONFIG =       require 'app/common/config'
ModifierBanding =   require './modifierBanding'
ModifierBandedDoubleAttack =     require './modifierBandedDoubleAttack'

class ModifierBandingDoubleAttack extends ModifierBanding

  type:"ModifierBandingDoubleAttack"
  @type:"ModifierBandingDoubleAttack"

  maxStacks: 1

  @description: "Double this minion's Attack at the end of your turn"

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealDoubleAttack"]

  @createContextObject: (attackBuff=0, options = undefined) ->
    contextObject = super(options)
    contextObject.appliedName = "Zeal: Lion\'s Growth"
    bandedContextObject = ModifierBandedDoubleAttack.createContextObject(attackBuff)
    bandedContextObject.appliedName = "Zealed: Lion\'s Growth"
    contextObject.modifiersContextObjects = [bandedContextObject]
    return contextObject

module.exports = ModifierBandingDoubleAttack
