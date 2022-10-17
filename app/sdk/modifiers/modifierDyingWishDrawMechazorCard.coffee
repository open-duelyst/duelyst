ModifierDyingWish = require './modifierDyingWish'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Races = require 'app/sdk/cards/racesLookup.coffee'

class ModifierDyingWishDrawMechazorCard extends ModifierDyingWish

  type: "ModifierDyingWishDrawMechazorCard"
  @type: "ModifierDyingWishDrawMechazorCard"

  @description: "Put a random MECH minion into your action bar"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onDyingWish: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      mechCards = @getGameSession().getCardCaches().getRace(Races.Mech).getIsPrismatic(false).getIsSkinned(false).getCards()
      mechCard = mechCards[@getGameSession().getRandomIntegerForExecution(mechCards.length)]
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), mechCard.createNewCardData() )
      @getGameSession().executeAction(a)

module.exports = ModifierDyingWishDrawMechazorCard
