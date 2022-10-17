ModifierSurviveDamageWatch =  require './modifierSurviveDamageWatch'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
RemoveAction = require 'app/sdk/actions/removeAction'

class ModifierSurviveDamageWatchReturnToHand extends ModifierSurviveDamageWatch

  type:"ModifierSurviveDamageWatchReturnToHand"
  @type:"ModifierSurviveDamageWatchReturnToHand"

  @modifierName: ""
  @description: "When this minion survives damage, it returns to your action bar"

  hasTriggered: false

  onSurviveDamage: () ->
    if !@hasTriggered
      @hasTriggered = true
      # remove unit from board
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getCard().getOwnerId())
      removeOriginalEntityAction.setTarget(@getCard())
      @getGameSession().executeAction(removeOriginalEntityAction)

      # put a fresh card matching the original unit into hand
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), @getCard().createNewCardData())
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierSurviveDamageWatchReturnToHand
