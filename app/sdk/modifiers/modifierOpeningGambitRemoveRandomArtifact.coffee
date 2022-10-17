ModifierOpeningGambit = require './modifierOpeningGambit'
RemoveRandomArtifactAction =  require 'app/sdk/actions/removeRandomArtifactAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'


class ModifierOpeningGambitRemoveRandomArtifact extends ModifierOpeningGambit

  type: "ModifierOpeningGambitRemoveRandomArtifact"
  @type: "ModifierOpeningGambitRemoveRandomArtifact"

  @modifierName: "Opening Gambit"
  @description: "Destroy a random enemy artifact"

  onOpeningGambit: () ->
    general = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard()

    # if enemy General has at least one artifact on, then remove 1 artifact at random
    if modifiersByArtifact.length > 0
      removeArtifactAction = new RemoveRandomArtifactAction(@getGameSession())
      removeArtifactAction.setTarget(general)
      @getGameSession().executeAction(removeArtifactAction)

module.exports = ModifierOpeningGambitRemoveRandomArtifact
