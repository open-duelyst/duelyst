ModifierOpeningGambit = require './modifierOpeningGambit'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
PlayerModifierCannotReplace = require 'app/sdk/playerModifiers/playerModifierCannotReplace'

class ModifierOpeningGambitReplaceHand extends ModifierOpeningGambit

  type:"ModifierOpeningGambitReplaceHand"
  @type:"ModifierOpeningGambitReplaceHand"

  onOpeningGambit: (action) ->
    super(action)
    # don't try to replace anything if deck is empty
    if @getCard().getOwner().getDeck().getDrawPile().length < 1
      return

    if @getOwner().getActivePlayerModifiersByClass(PlayerModifierCannotReplace).length == 0 # if not being blocked by the Riddle (cannot replace any cards)
      # replace each card in hand - but don't count against normal replaces
      for card, handIndex in @getOwner().getDeck().getHand()
        if card?
          a = new ReplaceCardFromHandAction(@getGameSession(), @getCard().getOwnerId(), handIndex)
          a.forcedReplace = true
          this.getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitReplaceHand
