ModifierOpeningGambit = require './modifierOpeningGambit'
ModifierManaCostChange = require './modifierManaCostChange'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
GameFormat = require 'app/sdk/gameFormat'

class ModifierOpeningGambitGrincher extends ModifierOpeningGambit

  type:"ModifierOpeningGambitGrincher"
  @type:"ModifierOpeningGambitGrincher"

  @description: "Put a random artifact into your action bar. It costs 2 less"

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      artifactCards = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        artifactCards = @getGameSession().getCardCaches().getIsLegacy(false).getType(CardType.Artifact).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        artifactCards = @getGameSession().getCardCaches().getType(CardType.Artifact).getIsHiddenInCollection(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      if artifactCards.length > 0
        artifactCard = artifactCards[@getGameSession().getRandomIntegerForExecution(artifactCards.length)] # random artifact
        cardDataOrIndexToPutInHand = artifactCard.createNewCardData()
        costChangeContextObject = ModifierManaCostChange.createContextObject(-3)
        costChangeContextObject.appliedName = "Grinched"
        cardDataOrIndexToPutInHand.additionalModifiersContextObjects = [costChangeContextObject]
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardDataOrIndexToPutInHand)
        @getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitGrincher
