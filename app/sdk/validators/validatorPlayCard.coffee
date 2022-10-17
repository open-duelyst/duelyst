Validator = require("./validator")
Player = require("app/sdk/player")
PlayCardFromHandAction = require("app/sdk/actions/playCardFromHandAction")
PlaySignatureCardAction = require("app/sdk/actions/playSignatureCardAction")
DamageAction = require("app/sdk/actions/damageAction")
_ = require("underscore")
i18next = require("i18next")

class ValidatorPlayCard extends Validator

  type:"ValidatorPlayCard"
  @type:"ValidatorPlayCard"

  onValidateAction:(event) ->
    super(event)
    gameSession = @getGameSession()
    action = event.action
    if action? and action.getIsValid() and !action.getIsImplicit() and (action instanceof PlayCardFromHandAction or action instanceof PlaySignatureCardAction)
      card = action.getCard()
      targetPosition = action.getTargetPosition()
      owner = action.getOwner()
      if !card?
        # playing nothing
        @invalidateAction(action, targetPosition, i18next.t("validators.invalid_card_message"))
      else if gameSession.getIsRunningAsAuthoritative() and action.cardDataOrIndex? and _.isObject(action.cardDataOrIndex)
        # playing card data instead of index
        @invalidateAction(action, targetPosition, i18next.t("validators.invalid_card_message"))
      else if !card.getIsPositionValidTarget(targetPosition)
        # playing card to board at an invalid position
        @invalidateAction(action, targetPosition, i18next.t("validators.invalid_card_target_message"))
      else if gameSession.getIsRunningAsAuthoritative() or owner.getPlayerId() == gameSession.getMyPlayerId()
        if action instanceof PlayCardFromHandAction
          if card.getIndex() != owner.getDeck().getCardIndexInHandAtIndex(action.indexOfCardInHand)
            # playing a card that does not match the index in hand
            @invalidateAction(action, targetPosition, i18next.t("validators.invalid_card_message"))
          else # validate that player is not simply stalling out the game
            actions = []
            currentTurn = @getGameSession().getCurrentTurn()
            for step in currentTurn.getSteps()
              actions = actions.concat(step.getAction().getFlattenedActionTree())

            hasFoundMeaningfulAction = false
            numCardsPlayedFromHand = 0
            for a in actions by -1
              if a instanceof PlayCardFromHandAction
                numCardsPlayedFromHand++
              if a instanceof DamageAction
                hasFoundMeaningfulAction = true
              if numCardsPlayedFromHand >= 10
                break
            if numCardsPlayedFromHand >= 10 and !hasFoundMeaningfulAction
              @invalidateAction(action, targetPosition, "Too many cards played without advancing board state.")
        else if action instanceof PlaySignatureCardAction
          if !card.getOwner().getIsSignatureCardActive()
            # trying to play signature card when it should not be active
            @invalidateAction(action, targetPosition, i18next.t("validators.card_isnt_ready_message"))
          else if card.getIndex() != owner.getCurrentSignatureCardIndex()
            # playing a card that does not match the index of the current signature card
            @invalidateAction(action, targetPosition, i18next.t("validators.invalid_card_message"))

module.exports = ValidatorPlayCard
