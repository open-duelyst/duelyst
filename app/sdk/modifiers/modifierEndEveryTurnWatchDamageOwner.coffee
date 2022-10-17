ModifierEndEveryTurnWatch = require './modifierEndEveryTurnWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEndEveryTurnWatchDamageOwner extends ModifierEndEveryTurnWatch

  type:"ModifierEndEveryTurnWatchDamageOwner"
  @type:"ModifierEndEveryTurnWatchDamageOwner"

  @modifierName:"Turn Watch"
  @description:"At end of EACH turn, deal %X damage to your General"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericDamageEnergySmall"]

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

    myGeneral = @getGameSession().getGeneralForPlayer(@getCard().getOwner())

    if myGeneral?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(myGeneral)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierEndEveryTurnWatchDamageOwner
