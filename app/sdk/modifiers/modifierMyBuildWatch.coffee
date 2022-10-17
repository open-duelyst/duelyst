ModifierBuildWatch = require './modifierBuildWatch'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'

class ModifierMyBuildWatch extends ModifierBuildWatch

  type:"ModifierMyBuildWatch"
  @type:"ModifierMyBuildWatch"

  getIsActionRelevant: (action) ->
    super(action) and action.getOwnerId() is @getCard().getOwnerId()

module.exports = ModifierMyBuildWatch
