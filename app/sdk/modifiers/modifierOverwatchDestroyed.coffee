ModifierOverwatch = require './modifierOverwatch'
DieAction = require './../actions/dieAction'

class ModifierOverwatchDestroyed extends ModifierOverwatch

  type:"ModifierOverwatchDestroyed"
  @type:"ModifierOverwatchDestroyed"

  @description: "When this minion is destroyed, %X"

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return super()

  getIsActionRelevant: (action) ->
    # watch for this unit dying
    return action instanceof DieAction and action.getTarget() == @getCard()

module.exports = ModifierOverwatchDestroyed
