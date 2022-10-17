ModifierOverwatchMovedNearby = require './modifierOverwatchMovedNearby'

class ModifierOverwatchMovedNearbyAttack extends ModifierOverwatchMovedNearby

  type:"ModifierOverwatchMovedNearbyAttack"
  @type:"ModifierOverwatchMovedNearbyAttack"

  onOverwatch: (action) ->
    source = action.getSource()
    attackAction = @getCard().actionAttack(source)
    attackAction.setIsStrikebackAllowed(false)
    @getGameSession().executeAction(attackAction)

module.exports = ModifierOverwatchMovedNearbyAttack
