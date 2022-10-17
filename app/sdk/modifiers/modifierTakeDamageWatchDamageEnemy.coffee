ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDamageEnemy extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDamageEnemy"
  @type:"ModifierTakeDamageWatchDamageEnemy"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onDamageTaken: (action) ->
    randomDamageAction = new RandomDamageAction(@getGameSession())
    randomDamageAction.setOwnerId(@getCard().getOwnerId())
    randomDamageAction.setSource(@getCard())
    randomDamageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(randomDamageAction)

module.exports = ModifierTakeDamageWatchDamageEnemy
