ModifierOverwatch = require './modifierOverwatch'
AttackAction = require './../actions/attackAction'

class ModifierOverwatchAttacked extends ModifierOverwatch

  type:"ModifierOverwatchAttacked"
  @type:"ModifierOverwatchAttacked"

  @description: "When this minion is attacked, %X"

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return super()

  getIsActionRelevant: (action) ->
    # watch for explicit attacks on this unit
    return action instanceof AttackAction and !action.getIsImplicit() and action.getTarget() == @getCard()

module.exports = ModifierOverwatchAttacked
