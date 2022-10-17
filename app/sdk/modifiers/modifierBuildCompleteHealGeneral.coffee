ModifierBuilding = require './modifierBuilding'
HealAction = require 'app/sdk/actions/healAction'

class ModifierBuildCompleteHealGeneral extends ModifierBuilding

  type:"ModifierBuildCompleteHealGeneral"
  @type:"ModifierBuildCompleteHealGeneral"

  healAmount: 0

  @createContextObject: (healAmount, description, transformCardData, turnsToBuild, options) ->
    contextObject = super(description, transformCardData, turnsToBuild, options)
    contextObject.healAmount = healAmount
    return contextObject

  onBuildComplete: () ->
    super()

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

module.exports = ModifierBuildCompleteHealGeneral
