Modifier = require './modifier'

i18next = require('i18next')

class ModifierToken extends Modifier

  type:"ModifierToken"
  @type:"ModifierToken"

  @isKeyworded: true
  @keywordDefinition: "Card not collectible"

  @modifierName: "Token"

  isRemovable: false


module.exports = ModifierToken
