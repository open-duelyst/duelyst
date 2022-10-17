Logger = require 'app/common/logger'
Action = require './action'
CardType = require 'app/sdk/cards/cardType'

class RemoveCardFromHandAction extends Action

  @type:"RemoveCardFromHandAction"

  targetPlayerId: null
  indexOfCardInHand: null

  constructor: (gameSession, indexOfCardInHand, targetPlayerId) ->
    @type ?= RemoveCardFromHandAction.type
    super(gameSession)

    @indexOfCardInHand = indexOfCardInHand
    @targetPlayerId = targetPlayerId

  _execute: () ->
    super()
    #Logger.module("SDK").debug "RemoveCardFromHandAction::execute"

    if @indexOfCardInHand?
      deck = @getGameSession().getPlayerById(@targetPlayerId).getDeck()
      cardIndex = deck.getCardIndexInHandAtIndex(@indexOfCardInHand)
      @getGameSession().removeCardByIndexFromHand(deck, cardIndex, @getGameSession().getCardByIndex(cardIndex), @)

  getIndexOfCardInHand: () ->
    return @indexOfCardInHand

  getTargetPlayerId: () ->
    return @targetPlayerId

module.exports = RemoveCardFromHandAction
