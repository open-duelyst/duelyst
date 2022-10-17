CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierOpeningGambit = require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
This modifier is used to apply modifiers to Generals on Opening Gambit
examples:
Your General gains +2 Attack
Enemy General gains -2 Attack
###
class ModifierOpeningGambitApplyModifiersToGeneral extends ModifierOpeningGambit

  type:"ModifierOpeningGambitApplyModifiersToGeneral"
  @type:"ModifierOpeningGambitApplyModifiersToGeneral"

  @description: ""

  modifiersContextObjects: null # modifier context objects for modifiers to apply

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, applyToOwnGeneral=false, applyToEnemyGeneral=false, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.applyToOwnGeneral = applyToOwnGeneral
    contextObject.applyToEnemyGeneral = applyToEnemyGeneral
    contextObject.description = description
    return contextObject

  onOpeningGambit: () ->
    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: () ->
    affectedEntities = []
    if @applyToOwnGeneral
      affectedEntities.push(@getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()))
    if @applyToEnemyGeneral
      affectedEntities.push(@getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()))
    return affectedEntities

module.exports = ModifierOpeningGambitApplyModifiersToGeneral
