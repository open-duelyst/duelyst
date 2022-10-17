ModifierCounter = require './modifierCounter'
ModifierCounterBuildProgressDescription = require './modifierCounterBuildProgressDescription'
Modifier = require './modifier'
StartTurnAction = require 'app/sdk/actions/startTurnAction'

i18next = require('i18next')

###
  Counts current build progress on the unit it is applied to and displays as a panel attached to the card
###
class ModifierCounterBuildProgress extends ModifierCounter

  type:"ModifierCounterBuildProgress"
  @type:"ModifierCounterBuildProgress"

  maxStacks: 1

  @createContextObject: (modTypeToTrack) ->
    contextObject = super()
    contextObject.modTypeToTrack = modTypeToTrack
    return contextObject

  getModifierContextObjectToApply: () ->
    modContextObject = ModifierCounterBuildProgressDescription.createContextObject(@getCurrentCount())
    modContextObject.appliedName = i18next.t("modifiers.building_counter_applied_name")

    return modContextObject

  onAfterAction: (event) ->
    super(event)
    action = event.action
    if action instanceof StartTurnAction
      @updateCountIfNeeded()

  getCurrentCount: () ->
    modifierBuilding = @getGameSession().getModifierClassForType(@modTypeToTrack)
    buildingMod = @getCard().getActiveModifierByClass(modifierBuilding)
    if buildingMod?
      return buildingMod.turnsRemaining
    else
      return 0

module.exports = ModifierCounterBuildProgress
