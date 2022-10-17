CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierSynergize = require './modifierSynergize'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
This modifier is used to apply modifiers to entities around an entity on synergize (when bloodborn spell is activated).
###
class ModifierSynergizeApplyModifiers extends ModifierSynergize

  type:"ModifierSynergizeApplyModifiers"
  @type:"ModifierSynergizeApplyModifiers"

  @description: ""

  modifiersContextObjects: null # modifier context objects for modifiers to apply
  managedByCard: false # whether card with opening gambit should manage the modifiers applied, i.e. when the card is silenced/killed these modifiers are removed
  auraIncludeSelf: true # whether modifiers should target card with opening gambit
  auraIncludeAlly: true # whether modifiers should target allied units
  auraIncludeEnemy: true # whether modifiers should target enemy units
  auraIncludeGeneral: true # whether modifiers should target enemy units
  auraRadius: 1

  fxResource: ["FX.Modifiers.ModifierSynergize", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, managedByCard=false, auraIncludeSelf=true, auraIncludeAlly=true, auraIncludeEnemy=true, auraIncludeGeneral=true, auraRadius=1, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.managedByCard = managedByCard
    contextObject.auraIncludeAlly = auraIncludeAlly
    contextObject.auraIncludeEnemy = auraIncludeEnemy
    contextObject.auraIncludeSelf = auraIncludeSelf
    contextObject.auraIncludeGeneral = auraIncludeGeneral
    contextObject.auraRadius = auraRadius
    contextObject.description = description
    return contextObject

  @createContextObjectForAllUnitsAndGenerals: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, true, true, true, true, CONFIG.WHOLE_BOARD_RADIUS, description, options)

  @createContextObjectForAllies: (modifiersContextObjects, managedByCard, auraRadius, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, true, false, false, auraRadius, description, options)

  @createContextObjectForNearbyAllies: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, true, false, false, 1, description, options)

  @createContextObjectForAllAllies: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, description, options)

  @createContextObjectForEnemies: (modifiersContextObjects, managedByCard, auraRadius, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, false, true, false, auraRadius, description, options)

  @createContextObjectForNearbyEnemies: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, false, true, false, 1, description, options)

  @createContextObjectForAllEnemies: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, false, true, false, CONFIG.WHOLE_BOARD_RADIUS, description, options)

  @createContextObjectForAllAlliesAndSelf: (modifiersContextObjects, managedByCard, description, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, true, true, false, false, CONFIG.WHOLE_BOARD_RADIUS, description, options)

  onSynergize: () ->
    if @modifiersContextObjects?
      for entity in @getAffectedEntities()
        for modifierContextObject in @modifiersContextObjects
          if @managedByCard
            @getGameSession().applyModifierContextObject(modifierContextObject, entity, @)
          else
            @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAffectedEntities: () ->
    entityList = @getGameSession().getBoard().getCardsWithinRadiusOfPosition(@getCard().position, @auraFilterByCardType, @auraRadius, @auraIncludeSelf, true, true)
    affectedEntities = []
    for entity in entityList
      if (@auraIncludeAlly and entity.getIsSameTeamAs(@getCard())) or (@auraIncludeEnemy and !entity.getIsSameTeamAs(@getCard()))
        if @auraIncludeGeneral or !entity.getIsGeneral()
          affectedEntities.push(entity)
    return affectedEntities


module.exports = ModifierSynergizeApplyModifiers
