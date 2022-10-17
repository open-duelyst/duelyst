ModifierStartTurnWatch = require './modifierStartTurnWatch'
RestoreChargeToAllArtifactsAction = require 'app/sdk/actions/restoreChargeToAllArtifactsAction'

class ModifierStartTurnWatchRestoreChargeToArtifacts extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchRestoreChargeToArtifacts"
  @type:"ModifierStartTurnWatchRestoreChargeToArtifacts"

  onTurnWatch: (action) ->
    super(action)

    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    restoreDurabilityAction = new RestoreChargeToAllArtifactsAction(@getGameSession())
    restoreDurabilityAction.setTarget(myGeneral)
    @getCard().getGameSession().executeAction(restoreDurabilityAction)

module.exports = ModifierStartTurnWatchRestoreChargeToArtifacts
