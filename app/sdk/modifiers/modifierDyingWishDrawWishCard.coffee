ModifierDyingWish = require './modifierDyingWish'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierDyingWishDrawWishCard extends ModifierDyingWish

  type: "ModifierDyingWishDrawWishCard"
  @type: "ModifierDyingWishDrawWishCard"

  @description: "Put a random Wish card into your action bar"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onDyingWish: () ->
    if @getGameSession().getIsRunningAsAuthoritative()

      wishCards = [{id: Cards.Spell.ScionsFirstWish},{id: Cards.Spell.ScionsSecondWish}, {id: Cards.Spell.ScionsThirdWish}]
      wishCard = wishCards[@getGameSession().getRandomIntegerForExecution(wishCards.length)]
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), wishCard)
      @getGameSession().executeAction(a)

module.exports = ModifierDyingWishDrawWishCard
