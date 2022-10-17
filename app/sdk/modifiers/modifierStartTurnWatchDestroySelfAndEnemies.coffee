ModifierStartTurnWatch = require './modifierStartTurnWatch'
CardType = require 'app/sdk/cards/cardType'
KillAction = require 'app/sdk/actions/killAction'

class ModifierStartTurnWatchDestroySelfAndEnemies extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDestroySelfAndEnemies"
  @type:"ModifierStartTurnWatchDestroySelfAndEnemies"

  @description: "At the start of your turn, destroy this minion and all enemy minions"

  onTurnWatch: (action) ->

    for enemyUnit in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
      if !enemyUnit.getIsGeneral()
        killAction = new KillAction(this.getGameSession())
        killAction.setOwnerId(@getCard().getOwnerId())
        killAction.setSource(@getCard())
        killAction.setTarget(enemyUnit)
        @getGameSession().executeAction(killAction)

    killAction = new KillAction(this.getGameSession())
    killAction.setOwnerId(@getCard().getOwnerId())
    killAction.setSource(@getCard())
    killAction.setTarget(@getCard())
    @getGameSession().executeAction(killAction)



module.exports = ModifierStartTurnWatchDestroySelfAndEnemies
