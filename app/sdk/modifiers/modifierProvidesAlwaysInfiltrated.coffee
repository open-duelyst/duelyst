Modifier = require './modifier'
ModifierAlwaysInfiltrated = require 'app/sdk/modifiers/modifierAlwaysInfiltrated'

class ModifierProvidesAlwaysInfiltrated extends Modifier

  type:"ModifierProvidesAlwaysInfiltrated"
  @type:"ModifierProvidesAlwaysInfiltrated"

  @isHiddenToUI: true

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierProvidesAlwaysInfiltrated"]

module.exports = ModifierProvidesAlwaysInfiltrated
