ModifierStartTurnWatch = require './modifierStartTurnWatch'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierStartTurnWatchImmolateDamagedMinions extends ModifierStartTurnWatch

  type: "ModifierStartTurnWatchImmolateDamagedMinions"
  @type: "ModifierStartTurnWatchImmolateDamagedMinions"

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericHeal", "FX.Modifiers.ModifierGenericDamageNearby"]

  onTurnWatch: () ->

    board = @getGameSession().getBoard()

    for unit in board.getUnits()
      if unit?.getOwnerId() == @getCard().getOwnerId() and !unit.getIsGeneral() and unit.getHP() < unit.getMaxHP()

        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getCard().getOwnerId())
        healAction.setTarget(unit)
        healAction.setHealAmount(4)
        @getGameSession().executeAction(healAction)

        enemyEntities = board.getEnemyEntitiesAroundEntity(unit, CardType.Unit, 1)
        for entity in enemyEntities
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(entity)
          damageAction.setDamageAmount(4)
          @getGameSession().executeAction(damageAction)

module.exports = ModifierStartTurnWatchImmolateDamagedMinions
