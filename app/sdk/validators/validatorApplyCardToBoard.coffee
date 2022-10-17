Validator = require("./validator")
Entity = require("app/sdk/entities/entity")
ApplyCardToBoardAction = require("app/sdk/actions/applyCardToBoardAction")
RandomPlayCardSilentlyAction = require("app/sdk/actions/randomPlayCardSilentlyAction")
i18next = require("i18next")
ModifierCustomSpawn = require 'app/sdk/modifiers/modifierCustomSpawn'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class ValidatorApplyCardToBoard extends Validator

  type:"ValidatorApplyCardToBoard"
  @type:"ValidatorApplyCardToBoard"

  onValidateAction:(event) ->
    super(event)
    action = event.action
    if action? and action.getIsValid() and action instanceof ApplyCardToBoardAction and !(action instanceof RandomPlayCardSilentlyAction)
      # applying a card to board
      card = action.getCard()
      targetPosition = action.getTargetPosition()
      if !@getGameSession().getBoard().isOnBoard(targetPosition)
        # applying a card to a position outside the board
        @invalidateAction(action, targetPosition, i18next.t("validators.position_off_board_message"))
      else if card instanceof Entity and !(action instanceof PlayCardFromHandAction and card.hasActiveModifierClass(ModifierCustomSpawn))
        obstruction = @getGameSession().getBoard().getObstructionAtPositionForEntity(targetPosition, card)
        if obstruction? and !obstruction.getIsRemoved() and @getGameSession().getCanCardBeScheduledForRemoval(obstruction, true)
          # applying an entity to an obstructed position
          @invalidateAction(action, targetPosition, i18next.t("validators.obstructed_position_message"))

module.exports = ValidatorApplyCardToBoard
