Modifier = require './modifier'

class ModifierEntersBattlefieldWatch extends Modifier

  type:"ModifierEntersBattlefieldWatch"
  @type:"ModifierEntersBattlefieldWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onActivate: () ->
    super()
    @onEntersBattlefield()

  onEntersBattlefield: () ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEntersBattlefieldWatch
