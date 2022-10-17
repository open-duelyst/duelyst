Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellDuplicator extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    entityToClone = board.getUnitAtPosition(applyEffectPosition)
    ownerId = @getOwnerId()

    if entityToClone?
      # put fresh copy of spell into deck
      a = new PutCardInDeckAction(@getGameSession(), ownerId, entityToClone.createNewCardData())
      @getGameSession().executeAction(a)
      b = new PutCardInDeckAction(@getGameSession(), ownerId, entityToClone.createNewCardData())
      @getGameSession().executeAction(b)
      c = new PutCardInDeckAction(@getGameSession(), ownerId, entityToClone.createNewCardData())
      @getGameSession().executeAction(c)

module.exports = SpellDuplicator
