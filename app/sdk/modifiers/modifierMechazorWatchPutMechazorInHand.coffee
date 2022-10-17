CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardAction = require 'app/sdk/actions/playCardAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierMechazorWatchPutMechazorInHand extends Modifier

  type:"ModifierMechazorWatchPutMechazorInHand"
  @type:"ModifierMechazorWatchPutMechazorInHand"

  @modifierName:"Spawn Another Mechazor"
  @description:"Whenever you summon MECHAZ0R, put a MECHAZ0R in your action bar"

  cardDataOrIndexToSpawn: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (e) ->
    super(e)

    action = e.action

    if (
      (action instanceof PlayCardAction and action.getOwnerId() is @getCard().getOwnerId() and action.getCard().getBaseCardId() is Cards.Spell.DeployMechaz0r) or
      (action instanceof PlayCardFromHandAction and action.getOwnerId() is @getCard().getOwnerId() and action.getCard().getBaseCardId() is Cards.Neutral.Mechaz0r)
    )
      a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), {id: Cards.Neutral.Mechaz0r})
      this.getGameSession().executeAction(a)

module.exports = ModifierMechazorWatchPutMechazorInHand
