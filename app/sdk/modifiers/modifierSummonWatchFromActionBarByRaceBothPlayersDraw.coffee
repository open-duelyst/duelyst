ModifierSummonWatchFromActionBar = require './modifierSummonWatchFromActionBar'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierSummonWatchFromActionBarByRaceBothPlayersDraw extends ModifierSummonWatchFromActionBar

  type:"ModifierSummonWatchFromActionBarByRaceBothPlayersDraw"
  @type:"ModifierSummonWatchFromActionBarByRaceBothPlayersDraw"

  targetRaceId: null
  drawAmount: 1

  @createContextObject: (targetRaceId, drawAmount, options) ->
    contextObject = super(options)
    contextObject.targetRaceId = targetRaceId
    contextObject.drawAmount = drawAmount
    return contextObject

  onSummonWatch: (action) ->

    for x in [1..@drawAmount]
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), general.getOwnerId()))

      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(@targetRaceId)

module.exports = ModifierSummonWatchFromActionBarByRaceBothPlayersDraw
