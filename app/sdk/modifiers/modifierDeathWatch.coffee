Modifier =           require './modifier'
DieAction =         require 'app/sdk/actions/dieAction'
CardType =           require 'app/sdk/cards/cardType'
Stringifiers =       require 'app/sdk/helpers/stringifiers'

i18next = require('i18next')

class ModifierDeathWatch extends Modifier

  type:"ModifierDeathWatch"
  @type:"ModifierDeathWatch"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.deathwatch_def")

  @modifierName:i18next.t("modifiers.deathwatch_name")
  @description: "Deathwatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierDeathwatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    # watch for a unit dying
    if @getIsActionRelevant(action)
      @onDeathWatch(action)

  onDeathWatch: (action) ->
    # override me in sub classes to implement special behavior

  getIsActionRelevant: (action) ->
    return action instanceof DieAction and action.getTarget()? and action.getTarget().getType() is CardType.Unit and action.getTarget() != @getCard()


module.exports = ModifierDeathWatch
