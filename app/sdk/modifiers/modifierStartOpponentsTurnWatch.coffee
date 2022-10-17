Modifier = require './modifier'

class ModifierStartOpponentsTurnWatch extends Modifier

  type:"ModifierStartOpponentsTurnWatch"
  @type:"ModifierStartOpponentsTurnWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onStartTurn: (e) ->
    super(e)

    if !@getCard().isOwnersTurn()
      action = @getGameSession().getExecutingAction()
      @onTurnWatch(action)

  onTurnWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierStartOpponentsTurnWatch
