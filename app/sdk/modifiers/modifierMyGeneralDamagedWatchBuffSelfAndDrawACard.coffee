Modifier = require './modifier.coffee'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch.coffee'
DamageAction = require 'app/sdk/actions/damageAction.coffee'

class ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard"
  @type:"ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard"

  @modifierName:"My General Damaged Watch"
  @description:"Whenever your General takes damage, give this minion %X and draw a card"

  @createContextObject: (statContextObject, description, options) ->
    contextObject = super(options)
    contextObject.description = description
    contextObject.modifiersContextObjects = statContextObject
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onDamageDealtToGeneral: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())
    @getGameSession().executeAction(@getCard().getOwner().getDeck().actionDrawCard())

module.exports = ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard
