ModifierSummonWatch = require './modifierSummonWatch'
BurnCardAction =  require 'app/sdk/actions/burnCardAction'

class ModifierSummonWatchBurnOpponentCards extends ModifierSummonWatch

  type:"ModifierSummonWatchBurnOpponentCards"
  @type:"ModifierSummonWatchBurnOpponentCards"

  cardsToBurn: 1

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  @createContextObject: (cardsToBurn=1, options) ->
    contextObject = super(options)
    contextObject.cardsToBurn = cardsToBurn
    return contextObject

  onSummonWatch: (action) ->
    for i in [1..@cardsToBurn]
      burnCardAction = new BurnCardAction(@getGameSession(), @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId()).getOwnerId())
      @getGameSession().executeAction(burnCardAction)

module.exports = ModifierSummonWatchBurnOpponentCards
