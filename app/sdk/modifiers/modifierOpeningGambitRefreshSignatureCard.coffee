ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'

class ModifierOpeningGambitRefreshSignatureCard extends ModifierOpeningGambit

  type: "ModifierOpeningGambitRefreshSignatureCard"
  @type: "ModifierOpeningGambitRefreshSignatureCard"

  @modifierName: "Opening Gambit"
  @description: "Refresh your Bloodbound Spell"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    @getGameSession().executeAction(@getOwner().actionActivateSignatureCard())

module.exports = ModifierOpeningGambitRefreshSignatureCard
