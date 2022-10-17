ModifierIntensify = require './modifierIntensify'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierIntensifyOneManArmy extends ModifierIntensify

  type:"ModifierIntensifyOneManArmy"
  @type:"ModifierIntensifyOneManArmy"

  onIntensify: () ->

    for i in [0...@getIntensifyAmount()]
      addCardToHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), {id: Cards.Faction1.KingsGuard})
      @getGameSession().executeAction(addCardToHandAction)

    putCardInDeckAction = new PutCardInDeckAction(@getGameSession(), @getOwnerId(), {id: Cards.Faction1.OneManArmy})
    @getGameSession().executeAction(putCardInDeckAction)

module.exports = ModifierIntensifyOneManArmy
