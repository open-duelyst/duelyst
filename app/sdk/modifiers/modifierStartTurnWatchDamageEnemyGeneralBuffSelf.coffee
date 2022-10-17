ModifierStartTurnWatchBuffSelf = require './modifierStartTurnWatchBuffSelf'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'

CONFIG = require 'app/common/config'

class ModifierStartTurnWatchDamageEnemyGeneralBuffSelf extends ModifierStartTurnWatchBuffSelf

  type:"ModifierStartTurnWatchDamageEnemyGeneralBuffSelf"
  @type:"ModifierStartTurnWatchDamageEnemyGeneralBuffSelf"

  @modifierName:"Turn Watch"
  @description:"At the start of your turn, deal %X damage to the enemy General and this minion gains %Y"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericDamageFire", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, damageAmount, options) ->
    contextObject = super(attackBuff, maxHPBuff, options)
    contextObject.damageAmount = damageAmount

    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      replaceText = @description.replace /%Y/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
      return replaceText.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onTurnWatch: (action) ->
    # damage enemy General
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if general?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(general)
      if !@damageAmount
        damageAction.setDamageAmount(@getCard().getATK())
      else
        damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

    super(action) # then buff self

module.exports = ModifierStartTurnWatchDamageEnemyGeneralBuffSelf
