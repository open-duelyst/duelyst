Logger =     require 'app/common/logger'
PlayCardSilentlyAction =     require './playCardSilentlyAction'

###
Clone an entity on the board silently.
###

class CloneEntityAction extends PlayCardSilentlyAction

  @type:"CloneEntityAction"

  constructor: () ->
    @type ?= CloneEntityAction.type
    super

  getCard: () ->
    if !@_private.cachedCard?
      if @getGameSession().getIsRunningAsAuthoritative()
        # get source entity and create clone card data from it
        # this way when card is created it'll be an exact copy of the source
        source = @getSource()
        if source?
          @cardDataOrIndex = source.createCloneCardData()

      # create the card
      super()

    return @_private.cachedCard

module.exports = CloneEntityAction
