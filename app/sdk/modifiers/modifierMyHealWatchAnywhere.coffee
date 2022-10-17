Modifier =   require './modifier'
HealAction = require 'app/sdk/actions/healAction'

class ModifierMyHealWatchAnywhere extends Modifier

  type:"ModifierMyHealWatchAnywhere"
  @type:"ModifierMyHealWatchAnywhere"

  @modifierName:"MyHealWatchAnywhere"
  @description: "MyHealWatchAnywhere"

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyHealWatchAnywhere"]

  # "heal watchers" are not allowed to proc if they die during the step
  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    if @getIsActionRelevant(action)
      @onHealWatch(action)

  onHealWatch: (action) ->
    # override me in sub classes to implement special behavior

  getIsActionRelevant: (action) ->
    # watch for my action healing something (actually having HP increased by the heal, not just target of a healAction)
    if action instanceof HealAction and action.getOwnerId() is @getCard().getOwnerId() and action.getTotalHealApplied() > 0
      return true
    else
      return false

  onActivate: () ->
    # special check on activation in case this card is created mid-game
    # need to check all actions that occured this gamesession for triggers
    healActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    for action in healActions
      @onHealWatch(action)


module.exports = ModifierMyHealWatchAnywhere
