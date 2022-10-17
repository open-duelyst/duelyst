CONFIG = require 'app/common/config'
ModifierOpeningGambit = require './modifierOpeningGambit'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierOpeningGambitTeleportMinionsToThis extends ModifierOpeningGambit

  type: "ModifierOpeningGambitTeleportMinionsToThis"
  @type: "ModifierOpeningGambitTeleportMinionsToThis"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    entities = @getGameSession().getBoard().getUnits(true)
    for entity in entities
      if !entity.getIsGeneral() and entity != @getCard()
        randomTeleportAction = new RandomTeleportAction(@getGameSession())
        randomTeleportAction.setOwnerId(@getCard().getOwnerId())
        randomTeleportAction.setSource(entity)
        randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
        randomTeleportAction.setPatternSourcePosition(@getCard().getPosition())
        randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_3x3)
        @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierOpeningGambitTeleportMinionsToThis
