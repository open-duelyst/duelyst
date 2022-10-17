Modifier = require './modifier'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
GameSession = require 'app/sdk/gameSession'
i18next = require('i18next')

class ModifierRemoveAndReplaceEntity extends Modifier

  type:"ModifierRemoveAndReplaceEntity"
  @type:"ModifierRemoveAndReplaceEntity"

  maxStacks: 1

  @modifierName: ""
  @description: ""
  @isHiddenToUI: false
  isRemovable: false

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, originalCardId=undefined) ->
    contextObject = super()
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.originalCardId = originalCardId
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject and modifierContextObject.originalCardId
      cardName = GameSession.getCardCaches().getCardById(modifierContextObject.originalCardId).getName()
      return i18next.t("modifiers.temp_transformed",{unit_name: cardName})

  onExpire: () ->
    super()
    @removeAndReplace()

  removeAndReplace: () ->
    @remove()
    @replace()

  remove: () ->
    removeOriginalEntityAction = new RemoveAction(@getGameSession())
    removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
    removeOriginalEntityAction.setTarget(@getCard())
    @getGameSession().executeAction(removeOriginalEntityAction)

  replace: () ->
    spawnEntityAction = new PlayCardAsTransformAction(@getCard().getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, @cardDataOrIndexToSpawn)
    @getGameSession().executeAction(spawnEntityAction)

module.exports = ModifierRemoveAndReplaceEntity
