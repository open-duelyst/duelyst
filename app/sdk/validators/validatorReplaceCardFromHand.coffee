CONFIG = require 'app/common/config'
Validator = require("./validator")
Player = require("app/sdk/player")
ReplaceCardFromHandAction = require("app/sdk/actions/replaceCardFromHandAction")
_ = require 'underscore'
i18next = require("i18next")

class ValidatorReplaceCardFromHand extends Validator

  onValidateAction:(event) ->
    super(event)
    gameSession = @getGameSession()
    action = event.action
    if action? and action.getIsValid() and action instanceof ReplaceCardFromHandAction and !(action.getIsForcedReplace())
      owner = action.getOwner()
      if owner instanceof Player
        deck = owner.getDeck()
        if (gameSession.getIsRunningAsAuthoritative() or owner.getPlayerId() == gameSession.getMyPlayerId()) and !deck.getCardIndexInHandAtIndex(action.indexOfCardInHand)?
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.invalid_card_to_replace_message"))
        else if !deck.getCanReplaceCardThisTurn()
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.out_of_replaces_message"))

module.exports = ValidatorReplaceCardFromHand
