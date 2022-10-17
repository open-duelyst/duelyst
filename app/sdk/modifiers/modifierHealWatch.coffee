Modifier =   require './modifier'
HealAction = require 'app/sdk/actions/healAction'

class ModifierHealWatch extends Modifier

  type:"ModifierHealWatch"
  @type:"ModifierHealWatch"

  @modifierName:"HealWatch"
  @description: "HealWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierHealWatch"]

  # "heal watchers" are not allowed to proc if they die during the step
  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    # watch for ANY  minion or General being healed (actually having HP increased by the heal, not just target of a healAction)
    if action instanceof HealAction and action.getTotalHealApplied() > 0
      @onHealWatch(action)

  onHealWatch: (action) ->
    # override me in sub classes to implement special behavior


module.exports = ModifierHealWatch
