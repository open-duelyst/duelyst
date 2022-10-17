PlayerModifier = require './playerModifier'
AttackAction = require 'app/sdk/actions/attackAction'

class PlayerModifierFriendlyAttackWatch extends PlayerModifier

  type:"PlayerModifierFriendlyAttackWatch"
  @type:"PlayerModifierFriendlyAttackWatch"

  @modifierName:"PlayerModifierFriendlyAttackWatch"
  @description:"Whenever you attack with a friendly entity..."

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()

    if action instanceof AttackAction and source.getOwnerId() is @getOwnerId() and !action.getIsImplicit()
      @onFriendlyAttackWatch(action)

  onFriendlyAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = PlayerModifierFriendlyAttackWatch