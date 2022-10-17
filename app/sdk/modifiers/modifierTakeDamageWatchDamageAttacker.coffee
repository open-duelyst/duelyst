ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDamageAttacker extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDamageAttacker"
  @type:"ModifierTakeDamageWatchDamageAttacker"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this takes damage, deal %X damage to the attacker"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onDamageTaken: (action) ->
    targetToDamage = action.getSource()?.getAncestorCardOfType(CardType.Unit)
    if !targetToDamage # If we couldn't find a unit that dealt the damage, assume the source of damage was spell, in which case damage the general
      targetToDamage = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    if targetToDamage?
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(targetToDamage)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierTakeDamageWatchDamageAttacker
