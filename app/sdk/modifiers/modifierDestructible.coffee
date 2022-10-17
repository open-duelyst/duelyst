CONFIG =     require 'app/common/config'
Modifier =   require './modifier'
i18next = require('i18next')

###
  Destructible is a special modifier used to explain artifacts via keyword popout.
###
class ModifierDestructible extends Modifier

  type:"ModifierDestructible"
  @type:"ModifierDestructible"

  @modifierName:i18next.t("modifiers.destructible_name")
  @description: null
  @keywordDefinition:i18next.t("modifiers.destructible_def")
  @isHiddenToUI: true
  @isKeyworded: true
  maxStacks: 1

module.exports = ModifierDestructible
