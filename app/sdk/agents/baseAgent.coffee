CONFIG =       require 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
Logger =       require 'app/common/logger'

_ = require 'underscore'

###
BaseAgent - Base acting agent for taking actions in sdk game
- Abstract class
###


class BaseAgent
  name: "BaseAgent"
  unitIndicesByTag: null
  playerId: null

  ###*
  # BaseAgent constructor.
  # @public
  ###
  constructor: (playerId) ->
    @playerId = playerId

    @unitIndicesByTag = {}

  ###*
  # Stores the passed in unit with the given tag
  #
  # @param {Object} unit - a SDK unit
  # @param {string} tag - a string reference for later accessing this unit
  #
  ###
  addUnitWithTag: (unit, tag) ->
    @unitIndicesByTag[tag] = unit.index


  ###*
  # Returns the unit corresponding to the passed in tag
  #
  # @param {string} tag - a string reference to the unit
  #
  ###
  getUnitForTag: (gameSession, tag) ->
    return gameSession.getCardByIndex(@unitIndicesByTag[tag])


  ###*
  # _reactToGameStep
  # Override in subclasses to react to game steps
  # @param  {Object} lastStep - Last step shown by GameLayer
  ###
  gatherAgentActionSequenceAfterStep: (lastStep) ->
    # Does nothing - Override in subclass



module.exports = BaseAgent
