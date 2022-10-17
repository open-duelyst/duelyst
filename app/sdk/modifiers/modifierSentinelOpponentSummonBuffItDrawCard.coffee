ModifierSentinelOpponentSummon = require './modifierSentinelOpponentSummon'
Modifier = require './modifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierSentinelOpponentSummonBuffItDrawCard extends ModifierSentinelOpponentSummon

  type:"ModifierSentinelOpponentSummonBuffItDrawCard"
  @type:"ModifierSentinelOpponentSummonBuffItDrawCard"

  @createContextObject: (description, transformCardId, attackBuff=2, maxHPBuff=2, options) ->
    contextObject = super(description, transformCardId, options)
    contextObject.attackBuff = attackBuff
    contextObject.maxHPBuff = maxHPBuff
    return contextObject

  onOverwatch: (action) ->
    super(action) # transform unit
    # buff unit that was just summoned by enemy
    if action.getTarget()?
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(@attackBuff,@maxHPBuff)
      statContextObject.appliedName = "Spooky Strength"
      @getGameSession().applyModifierContextObject(statContextObject, action.getTarget())

      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))


module.exports = ModifierSentinelOpponentSummonBuffItDrawCard
