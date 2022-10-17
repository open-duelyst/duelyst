ModifierDyingWish = require './modifierDyingWish'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'

class ModifierDyingWishDrawRandomBattlePet extends ModifierDyingWish

  type: "ModifierDyingWishDrawRandomBattlePet"
  @type: "ModifierDyingWishDrawRandomBattlePet"

  @modifierName: "Dying Wish"
  @description: "Put a random Battle Pet into your action bar"

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  onDyingWish: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      neutralBattlePetCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRace(Races.BattlePet).getIsToken(true).getIsPrismatic(false).getIsSkinned(false).getCards()
      card = neutralBattlePetCards[@getGameSession().getRandomIntegerForExecution(neutralBattlePetCards.length)]
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), card.createNewCardData() )
      @getGameSession().executeAction(a)

module.exports = ModifierDyingWishDrawRandomBattlePet
