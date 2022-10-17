Modifier =   require './modifier'

###
  Base class for any modifier that will cause a unit to have custom spawn positions
  (other than Airdrop, as Airdrop is pre-defined)

###
class ModifierCustomSpawn extends Modifier

  type:"ModifierCustomSpawn"
  @type:"ModifierCustomSpawn"

  @modifierName:"Custom Spawn"
  @description: ""


  getCustomSpawnPositions: () ->
    # return an array of valid spawn positions
    # override this is sub-class with actual spawn positions
    return []

  fxResource: ["FX.Modifiers.ModifierCustomSpawn"]

module.exports = ModifierCustomSpawn
