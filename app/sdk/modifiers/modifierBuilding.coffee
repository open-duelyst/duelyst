Modifier = require './modifier'
ModifierStartTurnWatch = require './modifierStartTurnWatch'
ModifierEternalHeart = require './modifierEternalHeart'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
RemoveAction = require 'app/sdk/actions/removeAction'
CardType = require 'app/sdk/cards/cardType'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
GameSession = require 'app/sdk/gameSession'
ModifierCounterBuildProgress = require 'app/sdk/modifiers/modifierCounterBuildProgress'

i18next = require('i18next')

class ModifierBuilding extends ModifierStartTurnWatch

  type:"ModifierBuilding"
  @type:"ModifierBuilding"

  @modifierName: "Build"
  #@modifierName:i18next.t("modifiers.structure_name")
  @description:null


  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1
  isRemovable: false
  turnsToBuild: 1 # build (X) - total turns it takes for this unit to finish building
  turnsRemaining: 1 # counts down each turn
  isInherent: true

  fxResource: ["FX.Modifiers.Modifierbuilding"]

  @createContextObject: (description, transformCardData, turnsToBuild, options) ->
    contextObject = super(options)
    contextObject.description = description
    contextObject.turnsToBuild = turnsToBuild
    contextObject.transformCardData = transformCardData
    contextObject.turnsRemaining = turnsToBuild
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      cardName = GameSession.getCardCaches().getCardById(modifierContextObject.transformCardData.id).getName()
      return i18next.t("modifiers.building_text",{unit_name: cardName})

  onApplyToCardBeforeSyncState: () ->
    @getCard().setReferencedCardData(@transformCardData)
    @getGameSession().applyModifierContextObject(ModifierCounterBuildProgress.createContextObject("ModifierBuilding"), @getCard())

  onActivate: () ->
    super()

    # reset turns elapsed and duration when activating due to changed location
    # ex: played from hand to board
    if !@_private.cachedWasActiveInLocation and @_private.cachedIsActiveInLocation
      @setNumEndTurnsElapsed(0)
      @turnsRemaining = @turnsToBuild

  onTurnWatch: (action) ->
    super()
    @progressBuild()

  progressBuild: () ->
    if @turnsRemaining > 0
      @turnsRemaining--
      if @turnsRemaining <= 0
        @onBuildComplete()

  onBuildComplete: () ->
    @transformSelf()

  transformSelf: () ->
    # create the action to spawn the new entity before the existing entity is removed
    # because we may need information about the existing entity being replaced
    @transformCardData.additionalModifiersContextObjects ?= []
    @transformCardData.additionalModifiersContextObjects.push(ModifierTransformed.createContextObject(false,0,0))
    spawnAction = new PlayCardAsTransformAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPositionX(), @getCard().getPositionY(), @transformCardData)

    # remove the existing entity
    removingEntity = @getGameSession().getBoard().getCardAtPosition(@getCard().getPosition(), CardType.Unit)
    if removingEntity?
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(removingEntity)
      @getGameSession().executeAction(removeOriginalEntityAction)

    # spawn the new entity
    if spawnAction?
      @getGameSession().executeAction(spawnAction)
      return spawnAction.getTarget()

module.exports = ModifierBuilding
