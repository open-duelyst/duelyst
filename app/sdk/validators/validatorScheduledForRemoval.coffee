Validator = require("./validator")
Card = require("app/sdk/cards/card")
RevealHiddenCardAction = require("app/sdk/actions/revealHiddenCardAction")
RemoveModifierAction = require("app/sdk/actions/removeModifierAction")
i18next = require("i18next")

class ValidatorScheduledForRemoval extends Validator

  type:"ValidatorScheduledForRemoval"
  @type:"ValidatorScheduledForRemoval"

  onValidateAction:(event) ->
    super(event)
    action = event.action
    if action? and action.getIsValid() and action.getIsImplicit() and !(action instanceof RemoveModifierAction or action instanceof RevealHiddenCardAction)
      target = action.getTarget()
      if target instanceof Card and target.getIsPlayed()
        if target.getIsRemoved()
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.card_has_been_removed_message"))
        else if !action.getIsDepthFirst() and !@getGameSession().getCanCardBeScheduledForRemoval(target)
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.card_will_be_removed_message"))

module.exports = ValidatorScheduledForRemoval
