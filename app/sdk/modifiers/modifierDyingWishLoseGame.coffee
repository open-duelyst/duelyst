ModifierDyingWish = require './modifierDyingWish'
KillAction = require 'app/sdk/actions/killAction'

class ModifierDyingWishLoseGame extends ModifierDyingWish

  type:"ModifierDyingWishLoseGame"
  @type:"ModifierDyingWishLoseGame"

  name:"Dying Wish: Kill General"
  description: "When this minion dies, your general dies"

  @appliedName: "Life Link"
  @appliedDescription: ""

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericDamage"]

  onDyingWish: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general?
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(general)
      @getGameSession().executeAction(killAction)

module.exports = ModifierDyingWishLoseGame
