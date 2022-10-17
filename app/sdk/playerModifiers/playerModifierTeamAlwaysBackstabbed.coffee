PlayerModifier = require './playerModifier'
ModifierAlwaysBackstabbed = require 'app/sdk/modifiers/modifierAlwaysBackstabbed'
CONFIG = require 'app/common/config'

class PlayerModifierTeamAlwaysBackstabbed extends PlayerModifier

  type: "PlayerModifierTeamAlwaysBackstabbed"
  @type: "PlayerModifierTeamAlwaysBackstabbed"
  @isHiddenToUI: true

  maxStacks: 1

  isAura: true
  auraIncludeAlly: true
  auraIncludeBoard: true
  auraIncludeEnemy: false
  auraIncludeGeneral: true
  auraIncludeHand: false
  auraIncludeSelf: true
  auraRadius: CONFIG.WHOLE_BOARD_RADIUS

  modifiersContextObjects: null

  @createContextObject: (auraModifierAppliedName, auraModifierAppliedDescription, options) ->
    contextObject = super(options)
    auraModifier = ModifierAlwaysBackstabbed.createContextObject()
    auraModifier.appliedName = auraModifierAppliedName
    auraModifier.appliedDescription = auraModifierAppliedDescription
    contextObject.modifiersContextObjects = [auraModifier]
    return contextObject

module.exports = PlayerModifierTeamAlwaysBackstabbed