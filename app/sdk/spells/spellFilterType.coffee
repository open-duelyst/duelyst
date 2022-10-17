class SpellFilterType

  @None:0 # spell can be applied anywhere, affects every board position
  @EnemyDirect:1 # spell must be applied directly to an enemy, affects enemies only
  @EnemyIndirect:2 # spell can be applied anywhere, affects enemies only
  @AllyDirect:3 # spell must be applied to ally, affects allies only
  @AllyIndirect:4 # spell can be applied anywhere, affects allies only
  @NeutralDirect:5 # spell must be applied to unit, affects all units
  @NeutralIndirect:6 # spell can be applied anywhere, affects all units
  @SpawnSource:7 # spell can be applied in any standard spawn location (near your General or other friendly units)

module.exports = SpellFilterType
