CONFIG = require 'app/common/config'
ModifierOpeningGambit = require './modifierOpeningGambit'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class OpeningGambitTeleportAllNearby extends ModifierOpeningGambit

  type: "OpeningGambitTeleportAllNearby"
  @type: "OpeningGambitTeleportAllNearby"

  @modifierName: "Opening Gambit"
  @description: " Push ALL nearby minions and Generals to random spaces"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      randomTeleportAction = new RandomTeleportAction(@getGameSession())
      randomTeleportAction.setOwnerId(@getCard().getOwnerId())
      randomTeleportAction.setSource(entity)
      randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(randomTeleportAction)

module.exports = OpeningGambitTeleportAllNearby
