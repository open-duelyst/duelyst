ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpeningGambitDamageInFrontRow extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageInFrontRow"
  @type: "ModifierOpeningGambitDamageInFrontRow"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to all enemies in front of this"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onOpeningGambit: () ->
    playerOffset = 0
    if @getCard().isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
    board = @getCard().getGameSession().getBoard()
    offsetPosition = {x:@getCard().getPosition().x+playerOffset, y:@getCard().getPosition().y}
    while board.isOnBoard(offsetPosition)
      target = board.getUnitAtPosition(offsetPosition)

      if target? and target.getOwner() isnt @getCard().getOwner() # damage any enemy found
        damageAction = new DamageAction(@getCard().getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setTarget(target)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)
      previousOffset = offsetPosition
      offsetPosition = {x:previousOffset.x+playerOffset, y:previousOffset.y}


module.exports = ModifierOpeningGambitDamageInFrontRow
