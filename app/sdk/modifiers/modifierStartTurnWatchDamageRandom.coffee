ModifierStartTurnWatch = require './modifierStartTurnWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierStartTurnWatchDamageRandom extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDamageRandom"
  @type:"ModifierStartTurnWatchDamageRandom"

  @modifierName:"Turn Watch"
  @description:"At the start of your turn, deal %X damage to a random minion or General"

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericChainLightning"]

  @createContextObject: (damageAmount=0, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.damageAmount

      return replaceText
    else
      return @description

  onTurnWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      units = @getGameSession().getBoard().getUnits()
      if units.length > 0
        unitToDamage = units[@getGameSession().getRandomIntegerForExecution(units.length)]
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(unitToDamage)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierStartTurnWatchDamageRandom
