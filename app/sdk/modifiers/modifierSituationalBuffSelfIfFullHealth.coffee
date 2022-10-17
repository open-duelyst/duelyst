ModifierSituationalBuffSelf = require './modifierSituationalBuffSelf'

class ModifierSituationalBuffSelfIfFullHealth extends ModifierSituationalBuffSelf

  type:"ModifierSituationalBuffSelfIfFullHealth"
  @type:"ModifierSituationalBuffSelfIfFullHealth"

  @modifierName:"ModifierSituationalBuffSelfIfFullHealth"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (modifierContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifierContextObjects
    return contextObject

  getIsSituationActiveForCache: () ->
    if @getCard().getHP() == @getCard().getMaxHP()
      return true
    return false

module.exports = ModifierSituationalBuffSelfIfFullHealth
