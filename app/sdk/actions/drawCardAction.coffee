Logger =     require 'app/common/logger'
CONFIG =     require 'app/common/config'
PutCardInHandAction = require './putCardInHandAction'
HurtingDamageAction = require './hurtingDamageAction'

class DrawCardAction extends PutCardInHandAction

  @type:"DrawCardAction"

  cardIndexFromDeck: null # when set, card draw will not be random but will be a specific card from deck instead

  constructor: () ->
    @type ?= DrawCardAction.type
    super

  _execute: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      player = @getGameSession().getPlayerById(@getOwnerId())
      deck = player.getDeck()
      drawPile = deck.getDrawPile()

      # attempt to draw next card data from the deck.
      # if card data is still null post execution, indicates that no card was available to draw and player attempted to draw from an empty deck
      if @cardIndexFromDeck?
        index = @cardIndexFromDeck
      else if !@getGameSession().getAreDecksRandomized()
        index = drawPile.length - 1
      else
        index = @getGameSession().getRandomIntegerForExecution(drawPile.length)
      @cardDataOrIndex = @cardIndexFromDeck || drawPile[index]

      ### THE HURTING ###
      if @getIsDrawFromEmptyDeck() and !@burnCard
        # if no card, then deal unavoidable damage to General of player trying to draw a card
        damageTarget = @getGameSession().getGeneralForPlayerId(@getOwnerId())
        hurtingDamageAction = new HurtingDamageAction(this.getGameSession())
        hurtingDamageAction.setOwnerId(@getOwnerId())
        hurtingDamageAction.setTarget(damageTarget)
        @getGameSession().executeAction(hurtingDamageAction)

    # now call the super execute to put the card in hand
    super()

  ###*
   * Returns true if card was drawn from empty deck, false otherwise
   * NOTE: this will only return reliable values POST EXECUTION
   ###
  getIsDrawFromEmptyDeck: () ->
    return !@cardDataOrIndex? and @getGameSession().getAreDecksRandomized()

  ###*
   * Set a specific card index to be drawn.
   ###
  setCardIndexFromDeck: (index) ->
    @cardIndexFromDeck = index

  ###*
   * Returns true if card was drawn randomly from deck, false if card index was pre-chosen (draw a specific card)
   ###
  getIsRandomDraw: () ->
    if !@cardIndexFromDeck
      return false
    return true

module.exports = DrawCardAction
