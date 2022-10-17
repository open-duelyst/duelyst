ModifierOpeningGambit = require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
RefreshArtifactChargesAction = require 'app/sdk/actions/refreshArtifactChargesAction'
CONFIG = require 'app/common/config'

class ModifierOpeningGambitRefreshArtifacts extends ModifierOpeningGambit

  type: "ModifierOpeningGambitRefreshArtifacts"
  @type: "ModifierOpeningGambitRefreshArtifacts"

  @modifierName: "Opening Gambit"
  @description: "Repair all of your artifacts to full durability"

  onOpeningGambit: () ->
    refreshArtifactChargesAction = new RefreshArtifactChargesAction(@getCard().getGameSession())
    #target is your General
    refreshArtifactChargesAction.setTarget(@getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()))
    refreshArtifactChargesAction.setSource(@getCard())
    refreshArtifactChargesAction.setOwnerId(@getCard().getOwnerId())
    @getCard().getGameSession().executeAction(refreshArtifactChargesAction)

module.exports = ModifierOpeningGambitRefreshArtifacts
