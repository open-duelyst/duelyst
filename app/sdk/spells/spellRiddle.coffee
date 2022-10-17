Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellRiddle extends Spell

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.canConvertCardToPrismatic = false # retain prismatic state of the riddle spell

    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # put a Riddle in opponent's hand
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getGameSession().getOpponentPlayerIdOfPlayerId(@getOwnerId()), {id: Cards.Spell.Riddle})
      @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellRiddle
