Validator = require("./validator")
MoveAction = require("app/sdk/actions/moveAction")
AttackAction = require("app/sdk/actions/attackAction")
Entity = require("app/sdk/entities/entity")
i18next = require("i18next")

class ValidatorEntityAction extends Validator

  type:"ValidatorEntityAction"
  @type:"ValidatorEntityAction"

  onValidateAction:(event) ->
    super(event)
    action = event.action
    if action? and action.getIsValid() and !action.getIsImplicit()
      if action.getType() == MoveAction.type
        source = action.getSource()
        targetPosition = action.getTargetPosition()
        if !(source instanceof Entity)
          @invalidateAction(action, targetPosition, i18next.t("validators.not_a_valid_move_message"))
        else if !source.getCanMove()
          @invalidateAction(action, action.getSourcePosition(), i18next.t("validators.unit_cannot_move_message"))
        else if !source.getMovementRange().getIsPositionValid(@getGameSession().getBoard(), source, targetPosition)
          @invalidateAction(action, targetPosition, i18next.t("validators.invalid_move_position_message"))
      else if action.getType() == AttackAction.type
        source = action.getSource()
        targetPosition = action.getTargetPosition()
        if !(source instanceof Entity)
          @invalidateAction(action, targetPosition, i18next.t("validators.invalid_attack_message"))
        else if !source.getCanAttack() and !action.getIsAutomatic()
          @invalidateAction(action, action.getSourcePosition(), i18next.t("validators.unit_cannot_attack_message"))
        else if !source.getAttackRange().getIsPositionValid(@getGameSession().getBoard(), source, targetPosition)
          @invalidateAction(action, targetPosition, i18next.t("validators.invalid_attack_position_message"))

module.exports = ValidatorEntityAction
