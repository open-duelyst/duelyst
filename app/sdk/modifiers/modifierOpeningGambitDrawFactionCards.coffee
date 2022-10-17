ModifierOpeningGambit = require './modifierOpeningGambit'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
GameFormat = require 'app/sdk/gameFormat'
_ = require 'underscore'

class ModifierOpeningGambitDrawFactionCards extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDrawFactionCards"
  @type:"ModifierOpeningGambitDrawFactionCards"

  @modifierName:"Opening Gambit"
  @description:"Add 2 random cards from your Faction to your action bar"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      factionId = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getFactionId()
      factionCards = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        factionCards = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(factionId).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        factionCards = @getGameSession().getCardCaches().getFaction(factionId).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if factionCards?.length > 0
        # filter mythron cards
        factionCards = _.reject(factionCards, (card) ->
          return card.getRarityId() == 6
        )

      if factionCards.length > 0
        cardToPutInHand = factionCards[@getGameSession().getRandomIntegerForExecution(factionCards.length)]
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())

        cardToPutInHand = factionCards[@getGameSession().getRandomIntegerForExecution(factionCards.length)]
        a2 = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())

        @getGameSession().executeAction(a)
        @getGameSession().executeAction(a2)

module.exports = ModifierOpeningGambitDrawFactionCards
