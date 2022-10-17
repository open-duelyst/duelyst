Modifier = require './modifier'
ModifierInfiltrate = require 'app/sdk/modifiers/modifierInfiltrate'

class ModifierAlwaysInfiltrated extends Modifier

  type:"ModifierAlwaysInfiltrated"
  @type:"ModifierAlwaysInfiltrated"

  @isHiddenToUI: true

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAlwaysInfiltrated"]

module.exports = ModifierAlwaysInfiltrated
