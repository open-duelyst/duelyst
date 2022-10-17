Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellDejaVu extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->

    spellsPlayedToBoard = @getGameSession().getSpellsPlayed()
    ownerId = @getOwnerId()
    if spellsPlayedToBoard.length > 0
      for spell in spellsPlayedToBoard by -1
        if !spell.getIsFollowup() and spell.getOwnerId() == ownerId and !(spell is this) and !(spell.getBaseCardId() is Cards.Spell.DejaVu)
          spellToCopy = spell
          break

      if spellToCopy?
        # put fresh copy of spell into deck
        a = new PutCardInDeckAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
        @getGameSession().executeAction(a)
        b = new PutCardInDeckAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
        @getGameSession().executeAction(b)
        c = new PutCardInDeckAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
        @getGameSession().executeAction(c)
        d = new PutCardInDeckAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
        @getGameSession().executeAction(d)
        e = new PutCardInDeckAction(@getGameSession(), ownerId, spellToCopy.createNewCardData())
        @getGameSession().executeAction(e)

module.exports = SpellDejaVu
