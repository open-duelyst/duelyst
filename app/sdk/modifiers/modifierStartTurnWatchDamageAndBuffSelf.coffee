ModifierStartTurnWatchBuffSelf = require './modifierStartTurnWatchBuffSelf'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
CONFIG = require 'app/common/config'

class ModifierStartTurnWatchDamageAndBuffSelf extends ModifierStartTurnWatchBuffSelf

  type:"ModifierStartTurnWatchDamageAndBuffSelf"
  @type:"ModifierStartTurnWatchDamageAndBuffSelf"

  @modifierName:"Turn Watch"
  @description:"At the start of your turn, take %X damage but gain %Y"

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericChainLightning"]

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
    damageAction = new DamageAction(this.getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(@getCard())
    if !@damageAmount
      damageAction.setDamageAmount(@getCard().getATK())
    else
      damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

    super(action) # then buff self

module.exports = ModifierStartTurnWatchDamageAndBuffSelf
