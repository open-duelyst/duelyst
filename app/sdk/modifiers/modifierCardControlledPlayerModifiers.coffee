Logger = require 'app/common/logger'
Modifier = require './modifier'

###
  Modifier that applies player modifiers to either or both players and removes them when the applying card is silenced or removed.
###
class ModifierCardControlledPlayerModifiers extends Modifier

  type:"ModifierCardControlledPlayerModifiers"
  @type:"ModifierCardControlledPlayerModifiers"

  @modifierName:""
  @description:""

  modifiersContextObjects: null
  applyToOwnPlayer: false
  applyToEnemyPlayer: false

  @createContextObject: (modifiersContextObjects, applyToOwnPlayer=false, applyToEnemyPlayer=false, activeInHand=true, activeInDeck=true, activeInSignatureCards=true, activeOnBoard=true, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.applyToOwnPlayer = applyToOwnPlayer
    contextObject.applyToEnemyPlayer = applyToEnemyPlayer
    contextObject.activeInHand = activeInHand
    contextObject.activeInDeck = activeInDeck
    contextObject.activeInSignatureCards = activeInSignatureCards
    contextObject.activeOnBoard = activeOnBoard
    contextObject.description = description
    return contextObject

  @createContextObjectToTargetOwnPlayer: (modifiersContextObjects, activeInHand, activeInDeck, activeInSignatureCards, activeOnBoard, description, options) ->
    return @createContextObject(modifiersContextObjects, true, false, activeInHand, activeInDeck, activeInSignatureCards, activeOnBoard, description, options)

  @createContextObjectOnBoardToTargetOwnPlayer: (modifiersContextObjects, description, options) ->
    return @createContextObject(modifiersContextObjects, true, false, false, false, false, true, description, options)

  @createContextObjectInHandDeckToTargetOwnPlayer: (modifiersContextObjects,description, options) ->
    return @createContextObject(modifiersContextObjects, true, false, true, true, false, false, description, options)

  @createContextObjectToTargetEnemyPlayer: (modifiersContextObjects, activeInHand, activeInDeck, activeInSignatureCards, activeOnBoard, description, options) ->
    return @createContextObject(modifiersContextObjects, false, true, activeInHand, activeInDeck, activeInSignatureCards, activeOnBoard, description, options)

  @createContextObjectOnBoardToTargetEnemyPlayer: (modifiersContextObjects, description, options) ->
    return @createContextObject(modifiersContextObjects, false, true, false, false, false, true, description, options)

  @createContextObjectInHandDeckToTargetEnemyPlayer: (modifiersContextObjects, description, options) ->
    return @createContextObject(modifiersContextObjects, false, true, true, true, false, false, description, options)

  @createContextObjectOnBoardToTargetBothPlayers: (modifiersContextObjects, description, options) ->
    return @createContextObject(modifiersContextObjects, true, true, false, false, false, true, description, options)

  @createContextObjectInHandDeckToTargetBothPlayers: (modifiersContextObjects, description, options) ->
    return @createContextObject(modifiersContextObjects, true, true, true, true, false, false, description, options)

  onActivate: ()  ->
    super()
    #Logger.module("SDK").debug("#{@getGameSession().gameId} #{@getLogName()}.onActivate #{@getCard().getLogName()} board? #{@getIsOnBoardAndActiveForCache()} hand? #{@getIsInHandAndActiveForCache()} deck? #{@getIsInDeckAndActiveForCache()}")
    if @applyToOwnPlayer
      ownPlayerId = @getCard().getOwnerId()
      ownGeneral = @getGameSession().getGeneralForPlayerId(ownPlayerId)
      @applyManagedModifiersFromModifiersContextObjectsOnce(@modifiersContextObjects, ownGeneral)

    if @applyToEnemyPlayer
      opponentPlayerId = @getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId())
      opponentGeneral = @getGameSession().getGeneralForPlayerId(opponentPlayerId)
      @applyManagedModifiersFromModifiersContextObjectsOnce(@modifiersContextObjects, opponentGeneral)

  onDeactivate: () ->
    super()
    if @applyToOwnPlayer
      ownPlayerId = @getCard().getOwnerId()
      ownGeneral = @getGameSession().getGeneralForPlayerId(ownPlayerId)
      @removeManagedModifiersFromCard(ownGeneral)

    if @applyToEnemyPlayer
      opponentPlayerId = @getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId())
      opponentGeneral = @getGameSession().getGeneralForPlayerId(opponentPlayerId)
      @removeManagedModifiersFromCard(opponentGeneral)

module.exports = ModifierCardControlledPlayerModifiers
