ModifierCounter = require './modifierCounter'
ModifierCounterShadowCreepDescription = require './modifierCounterShadowCreepDescription'
StartTurnAction = require 'app/sdk/actions/startTurnAction'

i18next = require('i18next')

###
  Counts total number of shadow creep tiles owned by this player
###
class ModifierCounterShadowCreep extends ModifierCounter

  type:"ModifierCounterShadowCreep"
  @type:"ModifierCounterShadowCreep"

  maxStacks: 1

  @createContextObject: (modTypeToTrack) ->
    contextObject = super()
    contextObject.modTypeToTrack = modTypeToTrack
    return contextObject

  getModifierContextObjectToApply: () ->
    modContextObject = ModifierCounterShadowCreepDescription.createContextObject(@getCurrentCount())
    modContextObject.appliedName = i18next.t("modifiers.shadowcreep_counter_applied_name")

    return modContextObject

  getCurrentCount: () ->
    modifierStackingShadows = @getGameSession().getModifierClassForType(@modTypeToTrack)
    return modifierStackingShadows.getNumStacksForPlayer(@getGameSession().getBoard(), @getCard().getOwner())


module.exports = ModifierCounterShadowCreep
