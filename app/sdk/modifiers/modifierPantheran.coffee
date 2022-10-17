Modifier = require './modifier'
ModifierManaCostChange = require './modifierManaCostChange'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierPantheran extends Modifier

  type:"ModifierPantheran"
  @type:"ModifierPantheran"

  @modifierName:"Scion's Watch"
  @description: "Costs 0 if you've cast all three Scion's Wish spells this game"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: true

  hasPlayedWish1: false
  hasPlayedWish2: false
  hasPlayedWish3: false

  fxResource: ["FX.Modifiers.ModifierPantheran"]

  onAction: (e) ->
    super(e)

    # watch for all 3 of scion's wishes having been cast
    if !@getHasPlayedScionsWishes() and @checkForScionsWishes(e.action)
      @onHasPlayedScionsWishes()

  onActivate: () ->
    # special check on activation in case this card is created mid-game
    # need to check all actions that occured this gamesession for triggers
    if !@getHasPlayedScionsWishes() and @getGameSession().findAction(@checkForScionsWishes.bind(@))?
      @onHasPlayedScionsWishes()

  checkForScionsWishes: (action) ->
    # we're watching for a spell (but not a followup) being cast by this modifier's owner
    if (action instanceof PlayCardFromHandAction or action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId()
      card = action.getCard()
      if card?.type is CardType.Spell
        baseCardId = card.getBaseCardId()
        if baseCardId is Cards.Spell.ScionsFirstWish
          @hasPlayedWish1 = true
        else if baseCardId is Cards.Spell.ScionsSecondWish
          @hasPlayedWish2 = true
        else if baseCardId is Cards.Spell.ScionsThirdWish
          @hasPlayedWish3 = true

    return @getHasPlayedScionsWishes()

  onHasPlayedScionsWishes: () ->
    # if so, this minion costs 0
    manaModifier = ModifierManaCostChange.createContextObject(0)
    manaModifier.attributeBuffsAbsolute = ["manaCost"]
    @getGameSession().applyModifierContextObject(manaModifier, @getCard())

  getHasPlayedScionsWishes: () ->
    return @hasPlayedWish1 and @hasPlayedWish2 and @hasPlayedWish3

module.exports = ModifierPantheran
