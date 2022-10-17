Logger = require 'app/common/logger'
DamageAction = require './damageAction'
CardType =       require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class RandomDamageAction extends DamageAction

  @type: "RandomDamageAction"

  canTargetGenerals: false

  constructor: () ->
    @type ?= RandomDamageAction.type
    super

  _modifyForExecution: () ->
    super()

    # find target to damage
    if @getGameSession().getIsRunningAsAuthoritative()
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getSource(), CardType.Unit, CONFIG.WHOLE_BOARD_RADIUS)
      validEntities = []
      for entity in entities
        if !entity.getIsGeneral() || @canTargetGenerals
          validEntities.push(entity)

      if validEntities.length > 0
        unitToDamage = validEntities[@getGameSession().getRandomIntegerForExecution(validEntities.length)]
        @setTarget(unitToDamage)

module.exports = RandomDamageAction
