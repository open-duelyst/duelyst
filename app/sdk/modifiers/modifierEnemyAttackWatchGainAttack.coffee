ModifierEnemyAttackWatch = require './modifierEnemyAttackWatch'
Modifier = require './modifier'

class  ModifierEnemyAttackWatchGainAttack extends ModifierEnemyAttackWatch

  type:"ModifierEnemyAttackWatchGainAttack"
  @type:"ModifierEnemyAttackWatchGainAttack"

  attackBuff: 0
  buffName: null

  @createContextObject: (attackBuff=0, buffName, options) ->
    contextObject = super(options)
    contextObject.attackBuff = attackBuff
    contextObject.buffName = buffName
    return contextObject

  onEnemyAttackWatch: (action) ->

    target = action.getTarget()
    if target? and target is @getCard()
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(@attackBuff)
      statContextObject.appliedName = @buffName
      @getGameSession().applyModifierContextObject(statContextObject, @getCard())

module.exports = ModifierEnemyAttackWatchGainAttack
