ModifierOpeningGambitApplyPlayerModifiers = require './modifierOpeningGambitApplyPlayerModifiers'
PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'

class ModifierOpeningGambitApplyMechazorPlayerModifiers extends ModifierOpeningGambitApplyPlayerModifiers

  type:"ModifierOpeningGambitApplyMechazorPlayerModifiers"
  @type:"ModifierOpeningGambitApplyMechazorPlayerModifiers"

  @createContextObject: (progressAmount = 1, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [PlayerModifierMechazorBuildProgress.createContextObject(progressAmount)]
    contextObject.managedByCard = false
    contextObject.applyToOwnPlayer = true
    contextObject.applyToEnemyPlayer = false
    return contextObject

module.exports = ModifierOpeningGambitApplyMechazorPlayerModifiers
