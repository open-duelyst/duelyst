Modifier = require './modifier'
i18next = require 'i18next'

class ModifierBelongsToAllRaces extends Modifier

  type: "ModifierBelongsToAllRaces"
  @type: "ModifierBelongsToAllRaces"

  @modifierName:i18next.t("modifiers.belongs_to_all_races_name")
  @description:i18next.t("modifiers.belongs_to_all_races_def")

  fxResource: ["FX.Modifiers.ModifierBelongsToAllRaces"]

module.exports = ModifierBelongsToAllRaces
