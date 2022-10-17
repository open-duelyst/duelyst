Logger = require 'app/common/logger'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Entity = require './entity'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class Tile extends Entity

  type: CardType.Tile
  @type: CardType.Tile
  name: "Tile"

  hp: 0
  maxHP: 0
  manaCost: 0
  isTargetable: false
  isObstructing: false
  depleted: false
  dieOnDepleted: true # whether tile dies once used up
  obstructsOtherTiles: false
  canBeDispelled: true

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.occupant = null # current entity occupying tile
    p.occupantChangingAction = null # action that caused current unit to occupy tile

    return p

  getCanBeAppliedAnywhere: () ->
    return true

  silence: () ->
    if @canBeDispelled
      # silence/cleanse/dispel kills tiles
      @getGameSession().executeAction(@actionDie())

  cleanse: @::silence
  dispel: @::silence

  # region OCCUPANT

  setOccupant: (occupant) ->
    if @_private.occupant != occupant
      @_private.occupant = occupant
      @_private.occupantChangingAction = @getGameSession().getExecutingAction()

  getOccupant: () ->
    return @_private.occupant

  getOccupantChangingAction: () ->
    return @_private.occupantChangingAction

  setDepleted: (depleted) ->
    @depleted = depleted
    if @depleted and @getDieOnDepleted()
      @getGameSession().executeAction(@actionDie())

  getDepleted: () ->
    return @depleted

  getDieOnDepleted: ()->
    return @dieOnDepleted

  # endregion OCCUPANT

  getObstructsOtherTiles: () ->
    return @obstructsOtherTiles

module.exports = Tile
