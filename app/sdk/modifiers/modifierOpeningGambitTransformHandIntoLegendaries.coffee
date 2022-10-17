ModifierOpeningGambit = require './modifierOpeningGambit'
RemoveCardFromHandAction = require 'app/sdk/actions/removeCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
GameFormat = require 'app/sdk/gameFormat'
ModifierCannotBeRemovedFromHand = require './modifierCannotBeRemovedFromHand'

class ModifierOpeningGambitTransformHandIntoLegendaries extends ModifierOpeningGambit

  type: "ModifierOpeningGambitTransformHandIntoLegendaries"
  @type: "ModifierOpeningGambitTransformHandIntoLegendaries"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->

    if @getGameSession().getIsRunningAsAuthoritative()

      factionId = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getFactionId()
      factionCards = []
      neutralCards = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        factionCards = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(factionId).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(true).getIsSkinned(false).getCards()
        neutralCards = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Neutral).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(true).getIsSkinned(false).getCards()
      else
        factionCards = @getGameSession().getCardCaches().getFaction(factionId).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(true).getIsSkinned(false).getCards()
        neutralCards = @getGameSession().getCardCaches().getFaction(Factions.Neutral).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(true).getIsSkinned(false).getCards()
      possibleCards = [].concat(factionCards, neutralCards)

      if possibleCards.length > 0
        for card, i in @getOwner().getDeck().getCardsInHand()
          if card? and !card.hasActiveModifierClass(ModifierCannotBeRemovedFromHand)
            removeCardFromHandAction = new RemoveCardFromHandAction(@getGameSession(), i, @getOwnerId())
            @getGameSession().executeAction(removeCardFromHandAction)

            cardToAdd = possibleCards[@getGameSession().getRandomIntegerForExecution(possibleCards.length)]

            putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardToAdd.createNewCardData())
            @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierOpeningGambitTransformHandIntoLegendaries