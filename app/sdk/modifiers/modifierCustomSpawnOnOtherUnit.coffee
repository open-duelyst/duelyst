ModifierCustomSpawn =   require './modifierCustomSpawn'
CardType = require 'app/sdk/cards/cardType'

###
  Base class for any modifier that will cause a unit to have custom spawn positions
  (other than Airdrop, as Airdrop is pre-defined)

###
class ModifierCustomSpawnOnOtherUnit extends ModifierCustomSpawn

  type:"ModifierCustomSpawnOnOtherUnit"
  @type:"ModifierCustomSpawnOnOtherUnit"

  @modifierName:"Custom Spawn"
  @description: ""


  getCustomSpawnPositions: () ->
    validSpawnLocations = []
    board = @getGameSession().getBoard()
    for entity in board.getEntities()
      if entity.getType() is CardType.Unit and !entity.getIsGeneral()
        validSpawnLocations.push(entity.getPosition())
    return validSpawnLocations

  fxResource: ["FX.Modifiers.ModifierCustomSpawn"]

module.exports = ModifierCustomSpawnOnOtherUnit
