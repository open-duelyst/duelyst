SpellSpawnEntity = require './spellSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookup'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellInfiniteHowlers extends SpellSpawnEntity

  onApplyToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), {id: Cards.Spell.InfiniteHowlers})
    @getGameSession().executeAction(a)

module.exports = SpellInfiniteHowlers
