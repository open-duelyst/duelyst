Modifier =   require './modifier'
HealAction = require 'app/sdk/actions/healAction'

class ModifierAnyMinionHealWatch extends Modifier

  type:"ModifierAnyMinionHealWatch"
  @type:"ModifierAnyMinionHealWatch"

  @modifierName:"Any minion HealWatch"
  @description: ""

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierHealWatch"]

  # "heal watchers" are not allowed to proc if they die during the step
  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    # watch for any minion being healed
    target = action.getTarget()
    if action instanceof HealAction and !target.getIsGeneral() and action.getTotalHealApplied() > 0
      @onHealWatch(action)

  onHealWatch: (action) ->
    # override me in sub classes to implement special behavior


module.exports = ModifierAnyMinionHealWatch
