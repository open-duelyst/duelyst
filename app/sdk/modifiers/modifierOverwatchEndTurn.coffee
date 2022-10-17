ModifierOverwatch = require './modifierOverwatch'
EndTurnAction = require 'app/sdk/actions/endTurnAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOverwatchEndTurn extends ModifierOverwatch

  type:"ModifierOverwatchEndTurn"
  @type:"ModifierOverwatchEndTurn"

  @description: "When opponent ends turn, %X"

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return super()

  getIsActionRelevant: (action) ->
    if action instanceof EndTurnAction
      return true
    return false

module.exports = ModifierOverwatchEndTurn
