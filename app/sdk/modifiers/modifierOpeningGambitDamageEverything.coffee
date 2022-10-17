ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpeningGambitDamageEverything extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDamageEverything"
  @type:"ModifierOpeningGambitDamageEverything"

  damageAmount: 1
  includeSelf: false

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount=1, includeSelf=false, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.includeSelf = includeSelf
    return contextObject

  onOpeningGambit: (action) ->
    for unit in @getGameSession().getBoard().getUnits()
      if @includeSelf or unit isnt @getCard()
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(unit)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageEverything
