ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'

class ModifierOpeningGambitProgressBuild extends ModifierOpeningGambit

  type: "ModifierOpeningGambitProgressBuild"
  @type: "ModifierOpeningGambitProgressBuild"

  @modifierName: "Opening Gambit"
  @description: "Progress your buildings by 1"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
      for buildModifier in unit.getActiveModifiersByClass(ModifierBuilding)
        buildModifier.progressBuild()

module.exports = ModifierOpeningGambitProgressBuild
