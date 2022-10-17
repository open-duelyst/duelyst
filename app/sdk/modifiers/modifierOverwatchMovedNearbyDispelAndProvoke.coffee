ModifierOverwatchMovedNearby = require './modifierOverwatchMovedNearby'
ModifierSilence = require './modifierSilence'
ModifierProvoke = require './modifierProvoke'

class ModifierOverwatchMovedNearbyDispelAndProvoke extends ModifierOverwatchMovedNearby

  type:"ModifierOverwatchMovedNearbyDispelAndProvoke"
  @type:"ModifierOverwatchMovedNearbyDispelAndProvoke"

  onOverwatch: (action) ->
    # dispel enemy
    source = action.getSource()
    @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), source)

    # give provoke to self
    @getGameSession().applyModifierContextObject(ModifierProvoke.createContextObject(), @getCard())

module.exports = ModifierOverwatchMovedNearbyDispelAndProvoke
