CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierBond = require './modifierBond'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
_ = require 'underscore'

class ModifierBondPutCardsInHand extends ModifierBond

  type:"ModifierBondPutCardsInHand"
  @type:"ModifierBondPutCardsInHand"

  @description: "Draw some cards"

  fxResource: ["FX.Modifiers.ModifierBond"]

  @createContextObject: (cardIds, options) ->
    contextObject = super(options)
    contextObject.cardIds = cardIds
    return contextObject

  onBond: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      cardIds = @cardIds
      while cardIds?.length > 0
        id = cardIds.splice(@getGameSession().getRandomIntegerForExecution(cardIds.length), 1)[0]
        if id?
          a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), {id: id} )
          @getGameSession().executeAction(a)

module.exports = ModifierBondPutCardsInHand
