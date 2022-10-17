Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'

class ModifierOnDying extends Modifier

  type:"ModifierOnDying"
  @type:"ModifierOnDying"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (e) ->
    super(e)

    action = e.action

    # when our entity has died
    if action instanceof DieAction and action.getTarget() is @getCard() and @getCard().getIsRemoved()
      @onDying(action)

  onDying: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierOnDying
