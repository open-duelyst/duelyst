ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
CONFIG = require 'app/common/config'


class ModifierOpeningGambitDamageInFront extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageInFront"
  @type: "ModifierOpeningGambitDamageInFront"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to ANY minion in front of this"

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
    offsetPosition = {x:@getCard().getPosition().x+playerOffset, y:@getCard().getPosition().y}
    target = @getCard().getGameSession().getBoard().getUnitAtPosition(offsetPosition)

    if target? and !target.getIsGeneral() #if there is a unit in front of this one, then damage it
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setTarget(target)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageInFront
