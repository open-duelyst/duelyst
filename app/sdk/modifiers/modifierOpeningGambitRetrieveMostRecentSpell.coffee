ModifierOpeningGambit =   require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOpeningGambitRetrieveMostRecentSpell extends ModifierOpeningGambit

  type:"ModifierOpeningGambitRetrieveMostRecentSpell"
  @type:"ModifierOpeningGambitRetrieveMostRecentSpell"

  @modifierName:"Opening Gambit"
  @description:"Put a copy of the most recently cast spell into your action bar"

  onOpeningGambit: () ->
    spellsPlayedToBoard = @getGameSession().getSpellsPlayed()
    if spellsPlayedToBoard.length > 0
      for spell in spellsPlayedToBoard by -1
        if !spell.getIsFollowup()
          spellToCopy = spell
          break

      if spellToCopy?
        # put fresh copy of spell into hand
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), spellToCopy.createNewCardData())
        @getGameSession().executeAction(a)


module.exports = ModifierOpeningGambitRetrieveMostRecentSpell
