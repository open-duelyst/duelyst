CONFIG = require 'app/common/config'
ModifierBanded = require './modifierBanded'
ModifierFlying = require './modifierFlying'

class ModifierBandedFlying extends ModifierFlying

  type: "ModifierBandedFlying"
  @type: "ModifierBandedFlying"

  fxResource: ["FX.Modifiers.ModifierZealed"]

module.exports = ModifierBandedFlying
