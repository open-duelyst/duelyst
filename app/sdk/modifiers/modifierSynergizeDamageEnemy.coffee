ModifierSynergize = require './modifierSynergize'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSynergizeDamageEnemy extends ModifierSynergize

  type:"ModifierSynergizeDamageEnemy"
  @type:"ModifierSynergizeDamageEnemy"

  @description: "Deal %X damage to a random enemy"

  fxResource: ["FX.Modifiers.ModifierSynergize", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onSynergize: (action) ->
    randomDamageAction = new RandomDamageAction(@getGameSession())
    randomDamageAction.setOwnerId(@getCard().getOwnerId())
    randomDamageAction.setSource(@getCard())
    randomDamageAction.setDamageAmount(@damageAmount)
    randomDamageAction.canTargetGenerals = true
    @getGameSession().executeAction(randomDamageAction)

module.exports = ModifierSynergizeDamageEnemy
