ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class ModifierOpponentSummonWatchOpponentDrawCard extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchOpponentDrawCard"
  @type:"ModifierOpponentSummonWatchOpponentDrawCard"

  @modifierName:"Opponent Summon Watch"
  @description: "Whenever your opponent summons a minion, they draw a card"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

  onSummonWatch: (action) ->
    if action instanceof PlayCardFromHandAction
      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

module.exports = ModifierOpponentSummonWatchOpponentDrawCard
