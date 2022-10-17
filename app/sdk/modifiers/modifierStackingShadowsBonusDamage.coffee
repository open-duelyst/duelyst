Modifier = require './modifier'
ModifierStackingShadows = require './modifierStackingShadows'

class ModifierStackingShadowsBonusDamage extends Modifier

  type: "ModifierStackingShadowsBonusDamage"
  @type: "ModifierStackingShadowsBonusDamage"

  @modifierName: "Shadow Creep Bonus Damage"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true
  @isHiddenToUI: true

  fxResource: ["FX.Modifiers.ModifierShadowCreep"]

  @createContextObject: (flatBonus=0, multiplierBonus=1) ->
    contextObject = super()
    contextObject.bonusDamageAmount = flatBonus
    contextObject.multiplierBonusDamage = multiplierBonus
    return contextObject

  getFlatBonusDamage: () ->
    return @bonusDamageAmount

  getMultiplierBonusDamage: () ->
    return @multiplierBonusDamage

  onActivate: () ->
    super()

    # flush cached atk attribute for this card
    @getCard().flushCachedAttribute("atk")

  onDeactivate: () ->
    super()

    # flush cached atk attribute for this card
    @getCard().flushCachedAttribute("atk")

module.exports = ModifierStackingShadowsBonusDamage
