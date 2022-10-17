CONFIG = require 'app/common/config'
ModifierBanded = require './modifierBanded'
ModifierRanged = require './modifierRanged'
i18next = require 'i18next'


class ModifierBandedRanged extends ModifierRanged

  type: "ModifierBandedRanged"
  @type: "ModifierBandedRanged"

  @modifierName:i18next.t("modifiers.banded_ranged_name")
  @description:i18next.t("modifiers.banded_ranged_def")

  fxResource: ["FX.Modifiers.ModifierZealed", "FX.Modifiers.ModifierZealedRanged"]

module.exports = ModifierBandedRanged
