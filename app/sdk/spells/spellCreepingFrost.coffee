Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'

class SpellCreepingFrost extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getUnitAtPosition(applyEffectPosition)
    if entity?
      @getGameSession().applyModifierContextObject(ModifierStunnedVanar.createContextObject(), entity)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    enemyUnits = board.getEnemyEntitiesForEntity(general, CardType.Unit, false, false)
    additionalUnitsToStun = []
    for unit in enemyUnits
      if !unit.getIsGeneral() and (unit.hasActiveModifierClass(ModifierStunnedVanar) or unit.hasActiveModifierClass(ModifierStunned))
        adjacentEnemies = board.getFriendlyEntitiesAroundEntity(unit, CardType.Unit, 1, true, false)
        enemyToAdd = []
        for enemy in adjacentEnemies
          if !enemy.hasActiveModifierClass(ModifierStunnedVanar) and !enemy.hasActiveModifierClass(ModifierStunned)
            enemyToAdd.push(enemy)
        additionalUnitsToStun.push(enemyToAdd[@getGameSession().getRandomIntegerForExecution(enemyToAdd.length)])

    for unitToStun in additionalUnitsToStun
      @getGameSession().applyModifierContextObject(ModifierStunnedVanar.createContextObject(), unitToStun)

module.exports = SpellCreepingFrost
