Spell = require './spell'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class SpellIntensify extends Spell

  getIsActionRelevant: (action) ->
    # watch for instances of playing this card from hand
    if action instanceof PlayCardAction and action.getOwnerId() is @getOwnerId() and action.getCard().getBaseCardId() is @getBaseCardId()
      return true
    else
      return false

  getIntensifyAmount: () ->
    amount = 0
    relevantActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    if relevantActions?
      amount = relevantActions.length
    return amount

  module.exports = SpellIntensify