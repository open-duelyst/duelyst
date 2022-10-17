ModifierCannot = require './modifierCannot'
i18next = require('i18next')

class ModifierCannotMove extends ModifierCannot

  type:"ModifierCantMove"
  @type:"ModifierCantMove"

  @modifierName: i18next.t("modifiers.faction_3_spell_sand_trap_1")
  @description: i18next.t("modifiers.faction_3_spell_sand_trap_1")

  attributeBuffs:
    speed: 0
  attributeBuffsAbsolute: ["speed"]
  attributeBuffsFixed: ["speed"]


module.exports = ModifierCannotMove
