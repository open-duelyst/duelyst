Modifier = require './modifier'
i18next = require 'i18next'

class ModifierUntargetable extends Modifier

  type: "ModifierUntargetable"
  @type: "ModifierUntargetable"

  @modifierName:i18next.t("modifiers.untargetable_name")
  @description:i18next.t("modifiers.untargetable_def")

  maxStacks: 1

module.exports = ModifierUntargetable
