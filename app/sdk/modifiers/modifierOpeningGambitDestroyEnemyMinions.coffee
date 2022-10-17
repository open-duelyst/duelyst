CONFIG = require 'app/common/config'
ModifierOpeningGambit = require './modifierOpeningGambit'
KillAction = require 'app/sdk/actions/killAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitDestroyEnemyMinions extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDestroyEnemyMinions"
  @type: "ModifierOpeningGambitDestroyEnemyMinions"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->

    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, CONFIG.WHOLE_BOARD_RADIUS)

    for entity in entities
      if !entity.getIsGeneral() # this ability only kills minions, not Generals
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getCard().getOwnerId())
        killAction.setSource(@getCard())
        killAction.setTarget(entity)
        @getGameSession().executeAction(killAction)

module.exports = ModifierOpeningGambitDestroyEnemyMinions
