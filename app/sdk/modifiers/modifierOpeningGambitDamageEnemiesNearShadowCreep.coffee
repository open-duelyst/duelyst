ModifierOpeningGambit = require './modifierOpeningGambit'
Cards =  require 'app/sdk/cards/cardsLookup'
CardType =  require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpeningGambitDamageEnemiesNearShadowCreep extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageEnemiesNearShadowCreep"
  @type: "ModifierOpeningGambitDamageEnemiesNearShadowCreep"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to each enemy on or near friendly Shadow Creep"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount=0, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onOpeningGambit: () ->
    super()
    unitsToDamage = []
    board = @getGameSession().getBoard()
    for unit in board.getEnemyEntitiesForEntity(@getCard())
      tileAtPosition = board.getTileAtPosition(unit.getPosition(), true)
      if tileAtPosition? and tileAtPosition.getBaseCardId() is Cards.Tile.Shadow and tileAtPosition.getOwnerId() is @getCard().getOwnerId()
        unitsToDamage.push(unit)
      else
        for cardAroundUnit in board.getEnemyEntitiesAroundEntity(unit, CardType.Tile, 1, true)
          if cardAroundUnit.getBaseCardId() is Cards.Tile.Shadow
            unitsToDamage.push(unit)
            break
    for unit in unitsToDamage
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(unit)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageEnemiesNearShadowCreep
