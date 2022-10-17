Modifier = require './modifier'
ModifierBackstab = require './modifierBackstab'
ModifierAlwaysBackstabbed = require './modifierAlwaysBackstabbed'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierBackstabWatch extends Modifier

  type:"ModifierBackstabWatch"
  @type:"ModifierBackstabWatch"

  @modifierName:"Backstab Watch: Self"
  @description:"Backstab Watch: Self"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  getIsActionRelevant: (a) ->

    target = a.getTarget()
    card = @getCard()
    if card? and target? and a.getSource() == card
      return target.hasActiveModifierClass(ModifierAlwaysBackstabbed) or
        (card.hasModifierType(ModifierBackstab.type) and
        a instanceof AttackAction and
        @getGameSession().getBoard().getIsPositionBehindEntity(target, card.getPosition(), 1, 0))
    return false

  onAction: (event) ->
    super(event)
    action = event.action
    if @getIsActionRelevant(action)
      @onBackstabWatch(action)

  onBackstabWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierBackstabWatch
