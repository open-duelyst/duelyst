ModifierBuilding = require './modifierBuilding'
BonusManaAction = require 'app/sdk/actions/bonusManaAction'

class ModifierBuildCompleteGainTempMana extends ModifierBuilding

  type:"ModifierBuildCompleteGainTempMana"
  @type:"ModifierBuildCompleteGainTempMana"

  bonusMana: 0

  @createContextObject: (bonusMana, description, transformCardData, turnsToBuild, options) ->
    contextObject = super(description, transformCardData, turnsToBuild, options)
    contextObject.bonusMana = bonusMana
    return contextObject

  onBuildComplete: () ->
    super()

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    action = @getGameSession().createActionForType(BonusManaAction.type)
    action.setSource(@getCard())
    action.setTarget(general)
    action.bonusMana = @bonusMana
    action.bonusDuration = 1
    @getGameSession().executeAction(action)

module.exports = ModifierBuildCompleteGainTempMana
