ModifierBackstabWatch = require './modifierBackstabWatch'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
CardType = require 'app/sdk/cards/cardType'

i18next = require 'i18next'

class ModifierBackstabWatchStealSpellFromDeck extends ModifierBackstabWatch

  type:"ModifierBackstabWatchStealSpellFromDeck"
  @type:"ModifierBackstabWatchStealSpellFromDeck"

  @modifierName:i18next.t("modifiers.backstab_watch_steal_spell_from_deck_name")
  @description:i18next.t("modifiers.backstab_watch_steal_spell_from_deck_def")

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    return contextObject

  onBackstabWatch: (action) ->

    opponentPlayer = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
    opponentsDrawPile = opponentPlayer.getDeck().getDrawPile()

    indicesOfOpponentSpellsInDeck = []
    # check opponent's deck for spells
    for cardIndex, i in opponentsDrawPile
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getType() is CardType.Spell
        indicesOfOpponentSpellsInDeck.push(i)

    # get random spell from opponent's deck
    if indicesOfOpponentSpellsInDeck.length > 0
      indexOfCardInDeck = indicesOfOpponentSpellsInDeck[@getGameSession().getRandomIntegerForExecution(indicesOfOpponentSpellsInDeck.length)]
      opponentCardIndex = opponentsDrawPile[indexOfCardInDeck]
      opponentCard = @getGameSession().getCardByIndex(opponentCardIndex)

      if opponentCard?
        myNewCardData = opponentCard.createCardData()
        myNewCardData.ownerId = @getOwnerId() # reset owner id to player who will receive this card
        removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), opponentCard.getIndex(), opponentPlayer.getPlayerId())
        @getGameSession().executeAction(removeCardFromDeckAction)
        putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), myNewCardData)
        @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierBackstabWatchStealSpellFromDeck
