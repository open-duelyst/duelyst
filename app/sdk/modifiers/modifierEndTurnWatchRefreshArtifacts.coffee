ModifierEndTurnWatch = require './modifierEndTurnWatch'
RefreshArtifactChargesAction = require 'app/sdk/actions/refreshArtifactChargesAction'

class ModifierEndTurnWatchRefreshArtifacts extends ModifierEndTurnWatch

  type: "ModifierEndTurnWatchRefreshArtifacts"
  @type: "ModifierEndTurnWatchRefreshArtifacts"

  @modifierName: "End Turn Watch"
  @description: "At the end of your turn, repair all of your artifacts to full durability"

  onTurnWatch: () ->
    refreshArtifactChargesAction = new RefreshArtifactChargesAction(@getCard().getGameSession())
    #target is your General
    refreshArtifactChargesAction.setTarget(@getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()))
    refreshArtifactChargesAction.setSource(@getCard())
    refreshArtifactChargesAction.setOwnerId(@getCard().getOwnerId())
    @getCard().getGameSession().executeAction(refreshArtifactChargesAction)

module.exports = ModifierEndTurnWatchRefreshArtifacts
