ModifierOverwatch = require './modifierOverwatch'
ModifierSentinelHidden = require './modifierSentinelHidden'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
RemoveAction = require 'app/sdk/actions/removeAction'

i18next = require('i18next')

class ModifierSentinel extends ModifierOverwatch

  type:"ModifierSentinel"
  @type:"ModifierSentinel"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.sentinel_def")

  @modifierName:i18next.t("modifiers.sentinel_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true
  isRemovable: false
  transformCardData: null
  maxStacks: 1

  hideAsModifierType: ModifierSentinelHidden.type

  fxResource: ["FX.Modifiers.ModifierSentinel"]

  @createContextObject: (description, transformCardData, options) ->
    contextObject = super(description, options)
    contextObject.transformCardData = transformCardData
    return contextObject

  onOverwatch: (action) ->
    @transformSelf() # sentinels transform when overwatch triggers
    # override me in sub classes to implement special behavior for when overwatch is triggered

  transformSelf: () ->
    # create the action to spawn the new entity before the existing entity is removed
    # because we may need information about the existing entity being replaced
    spawnAction = new PlayCardAsTransformAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPositionX(), @getCard().getPositionY(), @transformCardData)

    # remove the existing entity
    removingEntity = @getGameSession().getBoard().getCardAtPosition(@getCard().getPosition(), CardType.Unit)
    if removingEntity?
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(removingEntity)
      removeOriginalEntityAction.setIsDepthFirst(true)
      @getGameSession().executeAction(removeOriginalEntityAction)

    # spawn the new entity
    if spawnAction?
      spawnAction.setIsDepthFirst(true)
      @getGameSession().executeAction(spawnAction)
      return spawnAction.getTarget()

  getRevealedCardData: ()->
    return @transformCardData

module.exports = ModifierSentinel
