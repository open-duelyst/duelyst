CONFIG = require("app/common/config")
Validator = require("./validator")
Player = require("app/sdk/player")
DrawStartingHandAction = require("app/sdk/actions/drawStartingHandAction")
MoveAction = require("app/sdk/actions/moveAction")
AttackAction = require("app/sdk/actions/attackAction")
PlayCardFromHandAction = require("app/sdk/actions/playCardFromHandAction")
PlaySignatureCardAction = require("app/sdk/actions/playSignatureCardAction")
ApplyCardToBoardAction = require("app/sdk/actions/applyCardToBoardAction")
ReplaceCardFromHandAction = require("app/sdk/actions/replaceCardFromHandAction")
ResignAction = require("app/sdk/actions/resignAction")
EndTurnAction = require("app/sdk/actions/endTurnAction")
RollbackToSnapshotAction = require("app/sdk/actions/rollbackToSnapshotAction")
EndFollowupAction = require("app/sdk/actions/endFollowupAction")
i18next = require("i18next")

class ValidatorExecuteExplicitAction extends Validator

  type:"ValidatorExecuteExplicitAction"
  @type:"ValidatorExecuteExplicitAction"

  onValidateAction:(event) ->
    super(event)
    action = event.action
    if action? and action.getIsValid() and !action.getIsImplicit() and !action.getIsAutomatic() and action.getType() != ResignAction.type
      gameSession = @getGameSession()
      owner = action.getOwner()
      if owner instanceof Player and (gameSession.getIsRunningAsAuthoritative() or owner.getPlayerId() == gameSession.getMyPlayerId())
        # explicit action by a player
        if gameSession.isNew()
          if action instanceof DrawStartingHandAction
            if owner.getHasStartingHand()
              # player is attempting to draw multiple starting hands
              @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.cant_draw_starting_hand_again_message"))
            else if action.getMulliganIndices().length > CONFIG.STARTING_HAND_REPLACE_COUNT
              # player is attempting to mulligan more than allowed
              @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.max_replaces_reached_message"))
          else
            # player is attempting to execute an explicit action that is not one of the allowed types
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.game_hasnt_started_message"))
        else if gameSession.isActive()
          if gameSession.getCurrentTurn().getEnded()
            # turn is ended and no more actions are allowed
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.turn_has_ended_message"))
          else if owner != gameSession.getCurrentPlayer()
            # player is attempting to execute an explicit action during opponent's turn
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.opponents_turn_message"))
          else if gameSession.getTurnTimeRemaining() <= 0.0 and action.getType() != EndTurnAction.type
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.run_out_of_time_message"))
          else if owner.getRemainingMana() < action.getManaCost()
            # player doesn't have enough mana to execute this explicit action
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.not_enough_mana_message"))
          else if !(action.getType() == MoveAction.type || action.getType() == AttackAction.type || action.getType() == PlayCardFromHandAction.type || action.getType() == PlaySignatureCardAction.type || action.getType() == ReplaceCardFromHandAction.type || action.getType() == EndTurnAction.type || action.getType() == EndFollowupAction.type || action.getType() == RollbackToSnapshotAction.type || (action instanceof ApplyCardToBoardAction and action.getCard()?.getIsFollowup()))
            # player is attempting to execute an explicit action that is not one of the allowed types
            @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.cannot_do_that_message"))
        else
          # player is attempting to execute an explicit action when game is neither new nor active
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.game_is_over_message"))

module.exports = ValidatorExecuteExplicitAction
