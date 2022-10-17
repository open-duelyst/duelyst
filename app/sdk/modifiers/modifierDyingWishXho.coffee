ModifierDyingWish = require './modifierDyingWish'
ModifierManaCostChange = require './modifierManaCostChange'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup.coffee'

class ModifierDyingWishXho extends ModifierDyingWish

  type: "ModifierDyingWishXho"
  @type: "ModifierDyingWishXho"

  @modifierName: "Dying Wish"
  @description: "Put a random Songhai spell into your action bar. It costs 1 less"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onDyingWish: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      f2SpellCards = @getGameSession().getCardCaches().getFaction(Factions.Faction2).getType(CardType.Spell).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      spellCard = f2SpellCards[@getGameSession().getRandomIntegerForExecution(f2SpellCards.length)]
      cardData = spellCard.createNewCardData()
      cardData.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-1)]
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardData)
      @getGameSession().executeAction(a)

module.exports = ModifierDyingWishXho
