Modifier = require './modifier'

class ModifierObstructing extends Modifier

  type: "ModifierObstructing"
  @type: "ModifierObstructing"

  @modifierName: "Obstructing"
  @description: "This entity is obstructing its location"

  maxStacks: 1

module.exports = ModifierObstructing
