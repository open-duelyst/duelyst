UtilsGameSession = require 'app/common/utils/utils_game_session'
Action = require './action'
CardType = require 'app/sdk/cards/cardType'

class RemoveRandomArtifactAction extends Action

  @type:"RemoveRandomArtifactAction"

  constructor: () ->
    @type ?= RemoveRandomArtifactAction.type
    super

  _execute: () ->
    super()

    # remove artifact
    if @getGameSession().getIsRunningAsAuthoritative()
      target = @getTarget()
      if target?
        if !target.getIsGeneral() #artifacts are only on the general
          return

        # get all artifact modifiers by source card
        modifiersByArtifact = target.getArtifactModifiersGroupedByArtifactCard()

        # pick a random set of modifiers that were added by the same source card index and remove them
        if modifiersByArtifact.length > 0
          modifiersToRemove = modifiersByArtifact[@getGameSession().getRandomIntegerForExecution(modifiersByArtifact.length)]
          for modifier in modifiersToRemove by -1
            target.getGameSession().removeModifier(modifier)

module.exports = RemoveRandomArtifactAction
