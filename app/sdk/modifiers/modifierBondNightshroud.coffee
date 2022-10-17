ModifierBond =   require './modifierBond'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'
Races = require 'app/sdk/cards/racesLookup'

class ModifierBondNightshroud extends ModifierBond

  type:"ModifierBondNightshroud"
  @type:"ModifierBondNightshroud"

  @description: "Your General steals 1 Health from the enemy General for each friendly minion"

  onBond: () ->

    numFriendlyArcanysts = 0
    for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
      if unit.getBelongsToTribe(Races.Arcanyst)
        numFriendlyArcanysts++

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(numFriendlyArcanysts)
    @getGameSession().executeAction(healAction)

    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getOwnerId())
    damageAction.setTarget(enemyGeneral)
    damageAction.setDamageAmount(numFriendlyArcanysts)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierBondNightshroud
