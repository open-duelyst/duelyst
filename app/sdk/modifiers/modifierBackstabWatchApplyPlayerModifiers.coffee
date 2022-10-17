ModifierBackstabWatch = require './modifierBackstabWatch'

class ModifierBackstabWatchApplyPlayerModifiers extends ModifierBackstabWatch

  type:"ModifierBackstabWatchApplyPlayerModifiers"
  @type:"ModifierBackstabWatchApplyPlayerModifiers"

  modifiersContextObjects: null # modifier context objects for modifiers to apply
  managedByCard: false # whether card with backstab should manage the modifiers applied, i.e. when the card is silenced/killed these modifiers are removed
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

  onBackstabWatch: () ->
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

module.exports = ModifierBackstabWatchApplyPlayerModifiers
