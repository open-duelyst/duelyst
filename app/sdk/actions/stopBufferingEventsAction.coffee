Logger =     require 'app/common/logger'
Action =     require './action'

class StopBufferingEventsAction extends Action

  @type:"StopBufferingEventsAction"

  constructor: () ->
    @type ?= StopBufferingEventsAction.type
    super

  isRemovableDuringScrubbing: () ->
    return false

  _execute: () ->
    super()

    @getGameSession().p_stopBufferingEvents()

module.exports = StopBufferingEventsAction
