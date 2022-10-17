Modifier = require './modifier'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSpellWatchAnywhereApplyModifiers extends Modifier

  type:"ModifierSpellWatchAnywhereApplyModifiers"
  @type:"ModifierSpellWatchAnywhereApplyModifiers"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: true
  activeOnBoard: false

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  @createContextObject: (modifiers, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiers
    return contextObject

  onAfterAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell (but not a followup) being cast by player who owns this entity
    if @getIsActionRelevant(action)
      @onSpellWatch(action)

  getIsActionRelevant: (action) ->
    return (action instanceof PlayCardFromHandAction or action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell

  onSpellWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  onActivate: () ->
    # special check on activation in case this card is created mid-game
    # need to check all actions that occured this gamesession for triggers
    spellActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    for action in spellActions
      @onSpellWatch(action)

module.exports = ModifierSpellWatchAnywhereApplyModifiers
