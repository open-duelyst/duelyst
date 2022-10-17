EVENTS = require 'app/common/event_types'

class Validator

  type:"Validator"
  @type:"Validator"

  _gameSession: null

  # region INITIALIZE

  constructor: (gameSession) ->
    @_gameSession = gameSession

  # endregion INITIALIZE

  # region EVENTS

  ###*
   * SDK event handler. Do not call this method manually.
   ###
  onEvent: (event) ->
    if event.type == EVENTS.terminate
      @_onTerminate(event)
    else if event.type == EVENTS.validate_action
      @onValidateAction(event)

  # endregion EVENTS

  # region GETTERS / SETTERS

  getGameSession: () ->
    @_gameSession

  getType: () ->
    return @type

  # endregion GETTERS / SETTERS

  # region VALIDATION

  invalidateAction: (action, position, message="Invalid Action!") ->
    # helper method for invalidating an action at a position with a message
    action.setIsValid(false)
    action.setValidationMessage(message)
    action.setValidationMessagePosition(position)
    action.setValidatorType(@getType())

  # endregion VALIDATION

  # region EVENTS

  _onTerminate: () ->
    # this method is automatically called when this object will never be used again

  onValidateAction:(event) ->
    # override in sub-class and set action's isValid state

  # endregion EVENTS

module.exports = Validator
