CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierSynergize = require './modifierSynergize'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
This modifier is used to apply modifiers to Generals on synergize (when you actiavte your BBS)
examples:
Your General gains +2 Attack
Enemy General gains -2 Attack
###
class ModifierSynergizeApplyModifiersToGeneral extends ModifierSynergize

  type:"ModifierSynergizeApplyModifiersToGeneral"
  @type:"ModifierSynergizeApplyModifiersToGeneral"

  @description: ""

  modifiersContextObjects: null # modifier context objects for modifiers to apply

  fxResource: ["FX.Modifiers.ModifierSynergize", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, applyToOwnGeneral=false, applyToEnemyGeneral=false, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.applyToOwnGeneral = applyToOwnGeneral
    contextObject.applyToEnemyGeneral = applyToEnemyGeneral
    contextObject.description = description
    return contextObject

  onSynergize: () ->
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

module.exports = ModifierSynergizeApplyModifiersToGeneral
