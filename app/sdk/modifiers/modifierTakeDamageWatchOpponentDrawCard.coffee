ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
CardType = require 'app/sdk/cards/cardType'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierTakeDamageWatchOpponentDrawCard extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchOpponentDrawCard"
  @type:"ModifierTakeDamageWatchOpponentDrawCard"


  @createContextObject: (options) ->
    contextObject = super(options)

    return contextObject

  onDamageTaken: (action) ->
    super(action)

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

module.exports = ModifierTakeDamageWatchOpponentDrawCard
