SpellKillTarget = require './spellKillTarget'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellEggGrenade extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    eggEntity = board.getUnitAtPosition(applyEffectPosition)
    enemyEntities = board.getEnemyEntitiesAroundEntity(eggEntity, CardType.Unit, 1)

    super(board,x,y,sourceAction)

    for entity in enemyEntities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(eggEntity.getOwnerId())
      damageAction.setSource(@)
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(4)
      @getGameSession().executeAction(damageAction)

  _postFilterPlayPositions: (validPositions) ->
    filteredPositions = []
    for position in validPositions
      entityAtPosition = @getGameSession().getBoard().getEntityAtPosition(position)
      if entityAtPosition? and entityAtPosition.getBaseCardId() is Cards.Faction5.Egg
        filteredPositions.push(position)
    return filteredPositions


module.exports = SpellEggGrenade
