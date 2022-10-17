Modifier =           require './modifier'
PlayCardAction =           require 'app/sdk/actions/playCardAction'
ApplyModifierAction =           require 'app/sdk/actions/applyModifierAction'

i18next = require('i18next')

class ModifierOpeningGambit extends Modifier

  type:"ModifierOpeningGambit"
  @type:"ModifierOpeningGambit"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.opening_gambit_def")

  @modifierName:i18next.t("modifiers.opening_gambit_name")
  @description:null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  triggered: false

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onActivate: () ->
    super()

    if !@triggered and @getCard().getIsPlayed()
      # always flag self as triggered when card becomes played
      @triggered = true
      executingAction = @getGameSession().getExecutingAction()

      # account for modifier activated by being applied
      if executingAction? and executingAction instanceof ApplyModifierAction
        parentAction = executingAction.getParentAction()
        if parentAction instanceof PlayCardAction then executingAction = parentAction

      if !executingAction? or (executingAction instanceof PlayCardAction and executingAction.getCard() == @getCard())
        # only trigger when played PlayCardAction or no action (i.e. during game setup)
        @getGameSession().p_startBufferingEvents()
        @onOpeningGambit()

  onOpeningGambit: () ->
    # override me in sub classes to implement special behavior

  getIsActiveForCache: () ->
    return !@triggered and super()

module.exports = ModifierOpeningGambit
