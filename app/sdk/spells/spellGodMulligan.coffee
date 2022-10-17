Spell = require './spell'
RemoveCardFromHandAction = require 'app/sdk/actions/removeCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
Factions = require 'app/sdk/cards/factionsLookup'
GameFormat = require 'app/sdk/gameFormat'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'
_ = require 'underscore'

class SpellGodMulligan extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      numUnremovableCards = 0
      for card, i in @getOwner().getDeck().getCardsInHand()
        if card?
          if !card.hasActiveModifierClass(ModifierCannotBeRemovedFromHand)
            removeCardFromHandAction = new RemoveCardFromHandAction(@getGameSession(), i, @getOwnerId())
            @getGameSession().executeAction(removeCardFromHandAction)
          else
            numUnremovableCards++

      if @getGameSession().getGameFormat() is GameFormat.Standard
        factionCards = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Vetruvian).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        factionCards = @getGameSession().getCardCaches().getFaction(Factions.Vetruvian).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if factionCards?.length > 0
        # filter mythron cards
        factionCards = _.reject(factionCards, (card) ->
          return card.getRarityId() == 6
        )

      if factionCards.length > 0
        numCardsToAdd = 5 - numUnremovableCards
        for x in [0..numCardsToAdd]
          cardToPutInHand = factionCards[@getGameSession().getRandomIntegerForExecution(factionCards.length)].createNewCardData()
          manaModifierContextObject = ModifierManaCostChange.createContextObject(-4)
          cardToPutInHand.additionalModifiersContextObjects ?= []
          cardToPutInHand.additionalModifiersContextObjects.push(manaModifierContextObject)

          putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardToPutInHand)
          @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellGodMulligan
