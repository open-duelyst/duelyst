Modifier = require './modifier'

i18next = require('i18next')

class ModifierTokenCreator extends Modifier

  type:"ModifierTokenCreator"
  @type:"ModifierTokenCreator"

  @isHiddenToUI: true

  @modifierName: "Token" #TO DO: move this text to translation files

  isRemovable: false

module.exports = ModifierTokenCreator
