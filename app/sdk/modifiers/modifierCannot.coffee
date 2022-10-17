Modifier = require './modifier'

###
  Abstract modifier that should be the superclass for any modifiers that prevent a unit from doing something.
###
class ModifierCannot extends Modifier

  type: "ModifierCannot"
  @type: "ModifierCannot"

  @modifierName: "Cannot"
  @description: ""

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierCannot"]

module.exports = ModifierCannot
