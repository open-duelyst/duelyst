ModifierSynergize = require './modifierSynergize'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSynergizeDamageEnemyGeneral extends ModifierSynergize

  type:"ModifierSynergizeDamageEnemyGeneral"
  @type:"ModifierSynergizeDamageEnemyGeneral"

  @description:"Deal %X damage to the enemy General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onSynergize: (action) ->
    super(action)

    damageAction = new DamageAction(@getCard().getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setTarget(@getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()))
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierSynergizeDamageEnemyGeneral
