CardType = require '../cards/cardType'
ModifierOverwatchDestroyed = require './modifierOverwatchDestroyed'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOverwatchDestroyedPutCardInHand extends ModifierOverwatchDestroyed

  type:"ModifierOverwatchDestroyedPutCardInHand"
  @type:"ModifierOverwatchDestroyedPutCardInHand"

  onOverwatch: (action) ->
    a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), {id: @getCard().getId()})
    this.getGameSession().executeAction(a)

module.exports = ModifierOverwatchDestroyedPutCardInHand
