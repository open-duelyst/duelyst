ModifierBackstab = require './modifierBackstab'
i18next = require('i18next')

# Backstab modifier that can only stack once (this HAS backstab X rather than GAINS backstab X)

class ModifierHasBackstab extends ModifierBackstab

  type:"ModifierHasBackstab"
  @type:"ModifierHasBackstab"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.backstab_def")
  @description:"Has Backstab (%X)"

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierBackstab"]

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.backstabBonus
    else
      return @description

module.exports = ModifierHasBackstab
