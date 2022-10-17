Spell =  require './spell'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellLostInTheDesert extends Spell

  damageAmount: 5

  _findApplyEffectPositions: (position, sourceAction) ->
    applyPositions = []

    board = @getGameSession().getBoard()
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    enemyUnits = board.getEnemyEntitiesForEntity(general, CardType.Unit)
    player = @getGameSession().getPlayerById(@getOwnerId())

    for unit in enemyUnits
      if unit?
        unitsNearby = board.getFriendlyEntitiesAroundEntity(unit, CardType.Unit, 1)
        if unitsNearby.length is 0
          applyPositions.push(unit.getPosition())

    return applyPositions


  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setTarget(board.getUnitAtPosition({x: x, y: y}))
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = SpellLostInTheDesert
