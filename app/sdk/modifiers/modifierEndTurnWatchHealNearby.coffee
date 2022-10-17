ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEndTurnWatchHealNearby extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchHealNearby"
  @type:"ModifierEndTurnWatchHealNearby"

  @modifierName:"End Watch"
  @description:"At the end of your turn, restore %X Health to all nearby friendly minions"

  healAmount: 0
  healGeneral: false

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=1, healGeneral=false, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    contextObject.healGeneral = healGeneral
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onTurnWatch: (action) ->
    entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      if @healGeneral or !entity.getIsGeneral()
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getCard().getOwnerId())
        healAction.setSource(@getCard())
        healAction.setTarget(entity)
        healAction.setHealAmount(@healAmount)
        @getGameSession().executeAction(healAction)

module.exports = ModifierEndTurnWatchHealNearby
