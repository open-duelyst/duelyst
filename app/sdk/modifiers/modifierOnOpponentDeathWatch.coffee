CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDeathWatch = require './modifierDeathWatch'

class ModifierOnOpponentDeathWatch extends ModifierDeathWatch

  type:"ModifierOnOpponentDeathWatch"
  @type:"ModifierOnOpponentDeathWatch"

  @modifierName:"ModifierOnOpponentDeathWatch"
  @description:"Summon a %X on a random nearby space"

  getIsActionRelevant: (action) ->
    return super(action) and !action.getTarget().getIsSameTeamAs(@getCard())

module.exports = ModifierOnOpponentDeathWatch
