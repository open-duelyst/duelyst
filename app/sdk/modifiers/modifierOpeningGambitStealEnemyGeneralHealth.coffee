ModifierOpeningGambit = require './modifierOpeningGambit'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpeningGambitStealEnemyGeneralHealth extends ModifierOpeningGambit

  type:"ModifierOpeningGambitStealEnemyGeneralHealth"
  @type:"ModifierOpeningGambitStealEnemyGeneralHealth"

  @description: "Your General steals X Health from the enemy General"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  damageAmount: 0

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  onOpeningGambit: () ->

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@damageAmount)
    @getGameSession().executeAction(healAction)

    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(enemyGeneral)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitStealEnemyGeneralHealth
