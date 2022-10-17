ModifierBuilding = require './modifierBuilding'
CardType = require 'app/sdk/cards/cardType'

class ModifierBuildCompleteApplyModifiersToNearbyAllies extends ModifierBuilding

  type:"ModifierBuildCompleteApplyModifiersToNearbyAllies"
  @type:"ModifierBuildCompleteApplyModifiersToNearbyAllies"

  modifiers: null
  includeGeneral: false

  @createContextObject: (modifiers, includeGeneral, description, transformCardData, turnsToBuild, options) ->
    contextObject = super(description, transformCardData, turnsToBuild, options)
    contextObject.modifiers = modifiers
    contextObject.includeGeneral = includeGeneral
    return contextObject

  onBuildComplete: () ->
    super()

    allies = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    if allies? and @modifiers?
      for entity in allies
        if entity? and (@includeGeneral or !entity.getIsGeneral())
          for modifier in @modifiers
            @getGameSession().applyModifierContextObject(modifier, entity)

module.exports = ModifierBuildCompleteApplyModifiersToNearbyAllies
