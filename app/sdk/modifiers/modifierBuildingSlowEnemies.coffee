Modifier = require 'app/sdk/modifiers/modifier'
ModifierBuilding = require './modifierBuilding'

class ModifierBuildingSlowEnemies extends ModifierBuilding

  type:"ModifierBuildingSlowEnemies"
  @type:"ModifierBuildingSlowEnemies"

  auraAppliedName: null
  auraAppliedDescription: null
  speedChangeAppliedName: null
  speedChangeAppliedDescription: null

  onActivate: () ->
    super()
    speedBuffContextObject = Modifier.createContextObjectOnBoard()
    speedBuffContextObject.attributeBuffs = {"speed": 1}
    speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
    speedBuffContextObject.attributeBuffsFixed = ["speed"]
    speedBuffContextObject.appliedName = @speedChangeAppliedName
    speedBuffContextObject.appliedDescription = @speedChangeAppliedDescription
    auraContextObject = Modifier.createContextObjectWithOnBoardAuraForAllEnemies([speedBuffContextObject])
    auraContextObject.auraIncludeGeneral = true
    auraContextObject.appliedName = @auraAppliedName
    auraContextObject.appliedDescription = @auraAppliedDescription
    auraContextObject.isRemovable = false
    @getGameSession().applyModifierContextObject(auraContextObject, @getCard(), @)

module.exports = ModifierBuildingSlowEnemies
