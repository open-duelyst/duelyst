Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
ModifierDyingWish =   require './modifierDyingWish'
BonusManaAction =   require 'app/sdk/actions/bonusManaAction'

class ModifierDyingWishBonusMana extends ModifierDyingWish

  type:"ModifierDyingWishBonusMana"
  @type:"ModifierDyingWishBonusMana"

  @modifierName: "Bonus Mana"
  @description: "When this entity dies, its owner gains bonus mana"

  bonusMana: 1
  bonusDuration: 1

  onDyingWish: () ->
    super()

    # it is possible that this entity will be owned by the game session
    # but lets try to target the player's general
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general?
      action = @getGameSession().createActionForType(BonusManaAction.type)
      action.setTarget(general)
      action.bonusMana = @bonusMana
      action.bonusDuration = @bonusDuration
      @getGameSession().executeAction(action)

module.exports = ModifierDyingWishBonusMana
