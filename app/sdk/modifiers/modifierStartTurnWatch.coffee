Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierStartTurnWatch extends Modifier

  type:"ModifierStartTurnWatch"
  @type:"ModifierStartTurnWatch"

  @modifierName:"Start Turn Watch"
  @description: "Start Turn Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch"]

  onStartTurn: (e) ->
    super(e)

    if @getCard().isOwnersTurn()
      action = @getGameSession().getExecutingAction()
      @onTurnWatch(action)

  onTurnWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierStartTurnWatch
