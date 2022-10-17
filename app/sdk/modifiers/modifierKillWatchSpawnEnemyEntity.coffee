ModifierKillWatchSpawnEntity = require './modifierKillWatchSpawnEntity'

class ModifierKillWatchSpawnEnemyEntity extends ModifierKillWatchSpawnEntity

  type:"ModifierKillWatchSpawnEnemyEntity"
  @type:"ModifierKillWatchSpawnEnemyEntity"

  getSpawnOwnerId: (action) ->
    return action.getTarget().getOwnerId()

module.exports = ModifierKillWatchSpawnEnemyEntity
