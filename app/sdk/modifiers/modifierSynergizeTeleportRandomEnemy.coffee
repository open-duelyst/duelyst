CONFIG = require 'app/common/config'
ModifierSynergize = require './modifierSynergize'
TeleportBehindUnitAction = require 'app/sdk/actions/teleportBehindUnitAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSynergizeTeleportRandomEnemy extends ModifierSynergize

  type:"ModifierSynergizeTeleportRandomEnemy"
  @type:"ModifierSynergizeTeleportRandomEnemy"

  @description:"Teleport a random enemy to the space behind your General"

  canTargetGenerals: true

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  onSynergize: (action) ->
    super(action)

    # find target to teleport
    if @getGameSession().getIsRunningAsAuthoritative()
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, CONFIG.WHOLE_BOARD_RADIUS)
      validEntities = []
      for entity in entities
        if !entity.getIsGeneral() || @canTargetGenerals
          validEntities.push(entity)

      # pick a random enemy from all enemies found on the board
      if validEntities.length > 0
        unitToTeleport = validEntities[@getGameSession().getRandomIntegerForExecution(validEntities.length)]
        teleportBehindUnitAction = new TeleportBehindUnitAction(@getGameSession(), @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()), unitToTeleport)
        # and teleport it
        @getGameSession().executeAction(teleportBehindUnitAction)

module.exports = ModifierSynergizeTeleportRandomEnemy
