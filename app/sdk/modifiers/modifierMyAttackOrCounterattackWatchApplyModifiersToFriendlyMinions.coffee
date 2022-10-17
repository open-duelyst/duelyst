ModifierMyAttackOrCounterattackWatch = require './modifierMyAttackOrCounterattackWatch'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions extends ModifierMyAttackOrCounterattackWatch

  type:"ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions"
  @type:"ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions"

  modifierContextObjects: null
  raceId: null

  @createContextObject: (modifierContextObjects, raceId=null, options) ->
    contextObject = super(options)
    contextObject.modifierContextObjects = modifierContextObjects
    contextObject.raceId = raceId
    return contextObject

  onMyAttackOrCounterattackWatch: (action) ->
    if @modifierContextObjects?
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      friendlyMinions = @getGameSession().getBoard().getFriendlyEntitiesForEntity(general, CardType.Unit, true, false)
      for minion in friendlyMinions
        if !@raceId? or minion.getBelongsToTribe(@raceId)
          for modifierContextObject in @modifierContextObjects
            @getGameSession().applyModifierContextObject(modifierContextObject, minion)

module.exports = ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions
