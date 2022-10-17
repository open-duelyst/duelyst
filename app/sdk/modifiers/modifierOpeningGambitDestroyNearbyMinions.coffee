ModifierOpeningGambit = require './modifierOpeningGambit'
KillAction = require 'app/sdk/actions/killAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitDestroyNearbyMinions extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDestroyNearbyMinions"
  @type: "ModifierOpeningGambitDestroyNearbyMinions"

  @modifierName: "Opening Gambit"
  @description: "Destroy %X"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericChainLightningRed"]

  @createContextObject: (includeAllies=true, options) ->
    contextObject = super()
    contextObject.includeAllies = includeAllies
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.includeAllies
        replaceText = " ALL nearby minions"
      else
        replaceText = " all nearby enemy minions"
      return @description.replace /%X/, replaceText
    else
      return @description

  onOpeningGambit: () ->
    if @includeAllies
      entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    else
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)

    for entity in entities
      if !entity.getIsGeneral() # this ability only kills minions, not Generals
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getCard().getOwnerId())
        killAction.setSource(@getCard())
        killAction.setTarget(entity)
        @getGameSession().executeAction(killAction)

module.exports = ModifierOpeningGambitDestroyNearbyMinions
