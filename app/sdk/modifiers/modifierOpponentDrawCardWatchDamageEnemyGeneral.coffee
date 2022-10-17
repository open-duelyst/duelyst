ModifierOpponentDrawCardWatch = require './modifierOpponentDrawCardWatch'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOpponentDrawCardWatchDamageEnemyGeneral extends ModifierOpponentDrawCardWatch

  type:"ModifierOpponentDrawCardWatchDamageEnemyGeneral"
  @type:"ModifierOpponentDrawCardWatchDamageEnemyGeneral"

  @modifierName:"ModifierOpponentDrawCardWatchDamageEnemyGeneral"
  @description: "Whenever your opponent draws a card, deal %X damage to the enemy General"

  fxResource: ["FX.Modifiers.ModifierOpponentDrawCardWatchBuffSelf", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount=0, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onDrawCardWatch: (action) ->
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

module.exports = ModifierOpponentDrawCardWatchDamageEnemyGeneral
