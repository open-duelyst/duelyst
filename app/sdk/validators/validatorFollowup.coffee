Logger = require("app/common/logger")
EVENTS = require("app/common/event_types")
Validator = require("./validator")
ResignAction = require("app/sdk/actions/resignAction")
EndTurnAction = require("app/sdk/actions/endTurnAction")
PlayCardAction = require("app/sdk/actions/playCardAction")
StopBufferingEventsAction = require("app/sdk/actions/stopBufferingEventsAction")
RollbackToSnapshotAction = require("app/sdk/actions/rollbackToSnapshotAction")
UtilsGameSession = require("app/common/utils/utils_game_session")
UtilsPosition = require 'app/common/utils/utils_position'
_ = require 'underscore'
i18next = require("i18next")

class ValidatorFollowup extends Validator

  type:"ValidatorFollowup"
  @type:"ValidatorFollowup"

  _cardStack: null

  # region INITIALIZE

  constructor: (gameSession) ->
    super(gameSession)
    @_cardStack = []

  # endregion INITIALIZE

  # region EVENTS

  onEvent: (event) ->
    super(event)

    if event.type == EVENTS.deserialize
      @clearCardsWithFollowup(event)
    else if event.type == EVENTS.modify_action_for_validation
      @onModifyActionForValidation(event)
    else if event.type == EVENTS.added_action_to_queue
      @onAddedActionToQueue(event)

  # endregion EVENTS

  # region GETTERS / SETTERS

  getCardWaitingForFollowups: () ->
    return @_cardStack[@_cardStack.length - 1]

  getHasCardsWithFollowup: () ->
    return @_cardStack.length > 0

  getActionClearsFollowups: (action) ->
    return action instanceof StopBufferingEventsAction or action instanceof RollbackToSnapshotAction or action instanceof EndTurnAction or action instanceof ResignAction

  # endregion GETTERS / SETTERS

  # region CARDS

  clearCardsWithFollowup: () ->
    if @_cardStack.length > 0
      for card in @_cardStack
        card.clearFollowups()
      @_cardStack = []

  pushCardWithFollowup: (card) ->
    if card
      @_cardStack.push(card)

  popCardWaitingForFollowups: () ->
    if @getHasCardsWithFollowup()
      card = @_cardStack.pop()
      return card

  # endregion CARDS

  # region EVENTS

  onModifyActionForValidation:(event) ->
    action = event.action
    if action? and action.getIsValid() and !action.getIsImplicit() and !@getActionClearsFollowups(action)
      # check against current card waiting for followups
      cardWaitingForFollowups = @getCardWaitingForFollowups()
      if cardWaitingForFollowups? and cardWaitingForFollowups.getIsActionForCurrentFollowup(action)
        # action is the current followup this card is waiting for
        # inject followup properties into card so that it is ready for validation and play
        # this is done here instead of by the action creating the card
        # because doing it this way is far better for anti cheat
        cardWaitingForFollowups.injectFollowupPropertiesIntoCard(action.getCard())

  onValidateAction:(event) ->
    super(event)
    action = event.action
    if action? and action.getIsValid() and !action.getIsImplicit() and !@getActionClearsFollowups(action)
      # check against current card waiting for followups
      cardWaitingForFollowups = @getCardWaitingForFollowups()
      if cardWaitingForFollowups?
        # always validate against current followup
        currentFollowupCard = cardWaitingForFollowups.getCurrentFollowupCard()
        currentFollowupSourcePosition = currentFollowupCard.getFollowupSourcePosition()
        # a followup action is only valid if:
        # - the played card's id matches the id of the current followup (already checked)
        # - the played card's followup options must match the original followup options of the current followup
        # - the played card's target position is a valid target position
        if !cardWaitingForFollowups.getIsActionForCurrentFollowup(action)
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.invalid_followup_message"))
        else if action.sourcePosition.x != currentFollowupSourcePosition.x or action.sourcePosition.y != currentFollowupSourcePosition.y
          @invalidateAction(action, action.getSourcePosition(), i18next.t("validators.invalid_followup_source_message"))
        else if !UtilsPosition.getIsPositionInPositions(currentFollowupCard.getValidTargetPositions(), action.targetPosition)
          @invalidateAction(action, action.getTargetPosition(), i18next.t("validators.invalid_followup_target_message"))

  onAddedActionToQueue: (event) ->
    action = event.action
    if @getActionClearsFollowups(action)
      @clearCardsWithFollowup()
    else if action and !action.getIsImplicit()
      # check against current card waiting for followups
      cardWaitingForFollowups = @getCardWaitingForFollowups()
      if cardWaitingForFollowups?
        # remove current card's current followup as it has been added to queue
        cardWaitingForFollowups.removeCurrentFollowup()
        if !cardWaitingForFollowups.getHasFollowups()
          # pop current card off the stack if it has no more followups remaining
          @popCardWaitingForFollowups()

      if action instanceof PlayCardAction
        card = action.getCard()
        if card and card.getHasFollowups()
          # card has followups
          # push it onto the stack
          @pushCardWithFollowup(card)

  # endregion events

module.exports = ValidatorFollowup
