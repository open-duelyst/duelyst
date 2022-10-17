Modifier =   require './modifier'

i18next = require('i18next')

###
  Aidrop is a special modifier used primarily as a marker for logic in the Entity class (entity.coffee).
  In Entity.coffee the methods `getValidTargetPositions` and `getIsPositionValidTarget` will check for airdrop by modifier name
###
class ModifierAirdrop extends Modifier

  type:"ModifierAirdrop"
  @type:"ModifierAirdrop"

  @isKeyworded: true
  maxStacks: 1

  @modifierName:i18next.t("modifiers.airdrop_name")
  @description: null
  @keywordDefinition:i18next.t("modifiers.airdrop_def")

  fxResource: ["FX.Modifiers.ModifierAirdrop"]

module.exports = ModifierAirdrop
