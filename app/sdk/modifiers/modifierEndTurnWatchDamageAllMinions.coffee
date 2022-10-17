ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEndTurnWatchDamageAllMinions extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchDamageAllMinions"
  @type:"ModifierEndTurnWatchDamageAllMinions"

  @modifierName:"Turn Watch"
  @description:"At the end of your turn, deal %X damage to ALL other minions"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericChainLightning"]

  @createContextObject: (damageAmount=0, auraRadius=CONFIG.WHOLE_BOARD_RADIUS, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.auraRadius = auraRadius
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.damageAmount

      return replaceText
    else
      return @description

  onTurnWatch: (action) ->
    super(action)

    entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, @auraRadius)
    for entity in entities
      if !entity.getIsGeneral()
        damageAction = new DamageAction(this.getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierEndTurnWatchDamageAllMinions
