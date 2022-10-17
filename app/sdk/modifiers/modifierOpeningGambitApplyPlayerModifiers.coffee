Modifier = require './modifier'
ModifierOpeningGambit = require './modifierOpeningGambit'
UtilsGameSession = require 'app/common/utils/utils_game_session'

###
This modifier is used to apply player modifiers on spawn of an entity.
examples:
Next turn, enemy spells cast 2 more to cast
This turn, all your units cost 1 less to cast
###
class ModifierOpeningGambitApplyPlayerModifiers extends ModifierOpeningGambit

  type:"ModifierOpeningGambitApplyPlayerModifiers"
  @type:"ModifierOpeningGambitApplyPlayerModifiers"

  modifiersContextObjects: null # modifier context objects for modifiers to apply
  managedByCard: false # whether card with opening gambit should manage the modifiers applied, i.e. when the card is silenced/killed these modifiers are removed
  applyToOwnPlayer: false
  applyToEnemyPlayer: false

  @createContextObject: (modifiersContextObjects, managedByCard=false, applyToOwnPlayer=false, applyToEnemyPlayer=false, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.managedByCard = managedByCard
    contextObject.applyToOwnPlayer = applyToOwnPlayer
    contextObject.applyToEnemyPlayer = applyToEnemyPlayer
    return contextObject

  @createContextObjectToTargetOwnPlayer: (modifiersContextObjects, managedByCard, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, true, false, options)

  @createContextObjectToTargetEnemyPlayer: (modifiersContextObjects, managedByCard, options) ->
    return @createContextObject(modifiersContextObjects, managedByCard, false, true, options)

  onOpeningGambit: () ->
    if @modifiersContextObjects?
      # applying to owner
      if @applyToOwnPlayer
        general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
        for modifierContextObject in @modifiersContextObjects
          if @managedByCard
            @getGameSession().applyModifierContextObject(modifierContextObject, general, @)
          else
            @getGameSession().applyModifierContextObject(modifierContextObject, general)

      # applying to enemy
      if @applyToEnemyPlayer
        opponentPlayerId = @getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId())
        opponentGeneral = @getGameSession().getGeneralForPlayerId(opponentPlayerId)
        for modifierContextObject in @modifiersContextObjects
          if @managedByCard
            @getGameSession().applyModifierContextObject(modifierContextObject, opponentGeneral, @)
          else
            @getGameSession().applyModifierContextObject(modifierContextObject, opponentGeneral)

module.exports = ModifierOpeningGambitApplyPlayerModifiers
