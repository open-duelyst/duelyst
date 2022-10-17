ModifierOverwatch = require './modifierOverwatch'
MoveAction = require './../actions/moveAction'

class ModifierOverwatchMovedNearby extends ModifierOverwatch

  type:"ModifierOverwatchMovedNearby"
  @type:"ModifierOverwatchMovedNearby"

  @description: "When an enemy minion moves next to this minion, %X"

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return super()

  getIsActionRelevant: (action) ->
    # watch for explicit minion move next to this unit
    if action instanceof MoveAction and !action.getIsImplicit()
      card = @getCard()
      source = action.getSource()
      if source != card and !source.getIsSameTeamAs(card) and !source.getIsGeneral()
        myPosition = card.getPosition()
        targetPosition = action.getTargetPosition()
        return Math.abs(myPosition.x - targetPosition.x) <= 1 and Math.abs(myPosition.y - targetPosition.y) <= 1
    return false

module.exports = ModifierOverwatchMovedNearby
