Logger =     require 'app/common/logger'
StopBufferingEventsAction =     require './stopBufferingEventsAction'

class EndFollowupAction extends StopBufferingEventsAction

  @type:"EndFollowupAction"

  constructor: () ->
    @type ?= EndFollowupAction.type
    super

  isRemovableDuringScrubbing: () ->
    return false

module.exports = EndFollowupAction
