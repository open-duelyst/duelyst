ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'

class ModifierOpeningGambitActivateSignatureCard extends ModifierOpeningGambit

  type: "ModifierOpeningGambitActivateSignatureCard"
  @type: "ModifierOpeningGambitActivateSignatureCard"

  @modifierName: "Opening Gambit"
  @description: "Refresh your General's Bloodbound Spell"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    player = @getCard().getGameSession().getPlayerById(@getCard().getOwnerId())
    @getGameSession().executeAction(player.actionGenerateSignatureCard())

module.exports = ModifierOpeningGambitActivateSignatureCard
