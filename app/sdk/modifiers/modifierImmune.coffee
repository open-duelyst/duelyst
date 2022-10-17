Modifier = require './modifier'

###
  Abstract modifier superclass for all modifiers that add some type of immunity.
###

class ModifierImmune extends Modifier

  type: "ModifierImmune"
  @type: "ModifierImmune"

  @modifierName: "Immune"
  @description: ""

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierImmunity"]

module.exports = ModifierImmune
