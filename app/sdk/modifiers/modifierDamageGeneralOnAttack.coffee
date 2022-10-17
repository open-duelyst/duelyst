Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
ModifierDealDamageWatch = require './modifierDealDamageWatch'

class ModifierDamageGeneralOnAttack extends ModifierDealDamageWatch

  type:"ModifierDamageGeneralOnAttack"
  @type:"ModifierDamageGeneralOnAttack"

  @modifierName:"Damaging Attacks"
  @description:"Whenever this damages an enemy minion, deal %X damage to the enemy General"

  enemyOnly: true # should only trigger on dealing damage to enemy, not on ANY damage dealt

  fxResource: ["FX.Modifiers.ModifierDamageGeneralOnAttack"]

  @createContextObject: (damageAmount=0,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onDealDamage: (action) ->
    opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if action.getTarget() != opponentGeneral #if not attacking the enemy general
      # then damage the enemy general as well
      # we can't use an attack action here in case the general has strikeback
      damageAction = @getCard().getGameSession().createActionForType(DamageAction.type)
      damageAction.setSource(@getCard())
      damageAction.setTarget(opponentGeneral)
      damageAction.setDamageAmount(@damageAmount)
      @getCard().getGameSession().executeAction(damageAction)

module.exports = ModifierDamageGeneralOnAttack
