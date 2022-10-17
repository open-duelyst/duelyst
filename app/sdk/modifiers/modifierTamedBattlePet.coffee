Modifier = require './modifier'

class ModifierTamedBattlePet extends Modifier

  type:"ModifierTamedBattlePet"
  @type:"ModifierTamedBattlePet"

  @modifierName: "Tamed Battle Pet"
  @description: "Listens to owner's commands"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierTamedBattlePet"]

module.exports = ModifierTamedBattlePet
