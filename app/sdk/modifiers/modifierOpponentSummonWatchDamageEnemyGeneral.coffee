ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpponentSummonWatchDamageEnemyGeneral extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchDamageEnemyGeneral"
  @type:"ModifierOpponentSummonWatchDamageEnemyGeneral"

  @modifierName:"Opponent Summon Watch"
  @description: "Whenever your opponent summons a minion, deal %X damage to the enemy General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount=0,options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onSummonWatch: (action) ->
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if general?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setTarget(general)
      if !@damageAmount
        damageAction.setDamageAmount(@getCard().getATK())
      else
        damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOpponentSummonWatchDamageEnemyGeneral
