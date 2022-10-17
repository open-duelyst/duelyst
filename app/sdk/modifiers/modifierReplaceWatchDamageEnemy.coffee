ModifierReplaceWatch = require './modifierReplaceWatch'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierReplaceWatchDamageEnemy extends ModifierReplaceWatch

  type:"ModifierReplaceWatchDamageEnemy"
  @type:"ModifierReplaceWatchDamageEnemy"

  @modifierName:"Replace Watch (damage random enemy)"
  @description: "Whenever you replace a card, deal %X damage to a random enemy"

  fxResource: ["FX.Modifiers.ModifierReplaceWatch", "FX.Modifiers.ModifierGenericDamageSmall"]

  @createContextObject: (damageAmount, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onReplaceWatch: (action) ->
    randomDamageAction = new RandomDamageAction(@getGameSession())
    randomDamageAction.setOwnerId(@getCard().getOwnerId())
    randomDamageAction.setSource(@getCard())
    randomDamageAction.setDamageAmount(@damageAmount)
    randomDamageAction.canTargetGenerals = true
    @getGameSession().executeAction(randomDamageAction)

module.exports = ModifierReplaceWatchDamageEnemy
