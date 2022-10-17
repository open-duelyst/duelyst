EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierBeforeMyAttackWatch extends Modifier

  type:"ModifierBeforeMyAttackWatch"
  @type:"ModifierBeforeMyAttackWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onBeforeAction: (event) ->
    a = event.action
    if a instanceof AttackAction and a.getSource() == @getCard()
      @onBeforeMyAttackWatch(a)

  onBeforeMyAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierBeforeMyAttackWatch
