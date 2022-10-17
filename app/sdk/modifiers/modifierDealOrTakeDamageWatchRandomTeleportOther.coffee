RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDealOrTakeDamageWatch = require './modifierDealOrTakeDamageWatch'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierDealOrTakeDamageWatchRandomTeleportOther extends ModifierDealOrTakeDamageWatch

  type:"ModifierDealOrTakeDamageWatchRandomTeleportOther"
  @type:"ModifierDealOrTakeDamageWatchRandomTeleportOther"

  @description:"Whenever an enemy damages or takes damage from this, teleport that enemy to a random location"

  onDealOrTakeDamage: (action) ->
    super(action)

    # if the target of the action is this unit, the unit is receiving the damage
    if action.getTarget() == @getCard()
      targetToTeleport = action.getSource()?.getAncestorCardOfType(CardType.Unit)
      if !targetToTeleport # If we couldn't find a unit that dealt the damage, assume the source of damage was spell, in which case teleport the general
        targetToTeleport = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    else if action.getTarget().getOwnerId() isnt @getCard().getOwnerId() # else we are dealing damage
      targetToTeleport = action.getTarget()

    if targetToTeleport? and !_.contains(@_private.cardIndicesTeleported, targetToTeleport.getIndex())
      @_private.cardIndicesTeleported.push(targetToTeleport.getIndex())
      randomTeleportAction = new RandomTeleportAction(@getGameSession())
      randomTeleportAction.setOwnerId(@getCard().getOwnerId())
      randomTeleportAction.setSource(targetToTeleport)
      randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(randomTeleportAction)

  updateCachedState: () ->
    super()
    @_private.cardIndicesTeleported.length = 0

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.cardIndicesTeleported = []

    return p

module.exports = ModifierDealOrTakeDamageWatchRandomTeleportOther
