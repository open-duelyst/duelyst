CONFIG =       require('app/common/config')
Modifier =   require './modifier'
i18next = require 'i18next'

class ModifierFlying extends Modifier

  type:"ModifierFlying"
  @type:"ModifierFlying"

  @isKeyworded: true
  @modifierName: i18next.t("modifiers.flying_name")
  @description: null
  @keywordDefinition: i18next.t("modifiers.flying_def")

  maxStacks: 1

  attributeBuffs:
    speed: CONFIG.SPEED_INFINITE

  fxResource: ["FX.Modifiers.ModifierFlying"]

module.exports = ModifierFlying
