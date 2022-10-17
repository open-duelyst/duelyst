PlayerModifier = require './playerModifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsJavascript = require 'app/common/utils/utils_javascript'
_ = require("underscore")

class PlayerModifierEndTurnRespawnEntityWithBuff extends PlayerModifier

  type:"PlayerModifierEndTurnRespawnEntityWithBuff"
  @type:"PlayerModifierEndTurnRespawnEntityWithBuff"

  @isHiddenToUI: true
  durationEndTurn: 1
  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, modifiersContextObjects, position, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.position = position
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onEndTurn: (action) ->
    super(action)

    # add modifiers
    cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    if cardDataOrIndexToSpawn?
      if _.isObject(cardDataOrIndexToSpawn)
        cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)
      else
        cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
      cardDataOrIndexToSpawn.additionalModifiersContextObjects ?= []
      cardDataOrIndexToSpawn.additionalModifiersContextObjects = cardDataOrIndexToSpawn.additionalModifiersContextObjects.concat(UtilsJavascript.deepCopy(@modifiersContextObjects))

      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getPlayer().getPlayerId(), @position.x, @position.y, cardDataOrIndexToSpawn)
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = PlayerModifierEndTurnRespawnEntityWithBuff
