ModifierDyingWish = require './modifierDyingWish'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierDyingWishDamageGeneral extends ModifierDyingWish

  type:"ModifierDyingWishDamageGeneral"
  @type:"ModifierDyingWishDamageGeneral"

  name:"Dying Wish: Damage General"
  description: "When this minion dies, deal damage to its general"

  @appliedName: "Agonizing Death"
  @appliedDescription: ""

  damageAmount: null #if you want to deal a specific amount of damage, set it here, defaults to attack value of entity this modifier is attached to

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericDamage"]

  @getAppliedDescription: (contextObject) ->
    if @damageAmount
      return "When this minion dies, deal " + damageAmount + " damage to its general"
    else
      return "When this minion dies, deal its attack in damage to its general"

  onDyingWish: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setTarget(general)
      if !@damageAmount
        damageAction.setDamageAmount(@getCard().getATK())
      else
        damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierDyingWishDamageGeneral
