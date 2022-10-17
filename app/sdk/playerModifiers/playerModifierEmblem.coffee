PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'

class PlayerModifierEmblem extends PlayerModifier

  type:"PlayerModifierEmblem"
  @type:"PlayerModifierEmblem"

  # emblems should be visible
  @isHiddenToUI: false

  fxResource: ["FX.Modifiers.ModifierEmblem"]

module.exports = PlayerModifierEmblem
