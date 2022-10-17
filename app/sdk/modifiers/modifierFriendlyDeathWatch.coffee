Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierFriendlyDeathWatch extends Modifier

  type:"ModifierFriendlyDeathWatch"
  @type:"ModifierFriendlyDeathWatch"

  @modifierName:"ModifierFriendlyDeathWatch"
  @description: "Whenever a friendly minion dies..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierFriendlyDeathwatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    target = action.getTarget()
    entity = @getCard()
    # watch for a friendly unit dying
    if action instanceof DieAction and target?.type is CardType.Unit and target != entity and target.getOwnerId() is entity.getOwnerId()
      @onFriendlyDeathWatch(action)

  onFriendlyDeathWatch: (action) ->
    # override me in sub classes to implement special behavior


module.exports = ModifierFriendlyDeathWatch
