ModifierMyBuildWatch = require './modifierMyBuildWatch'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierMyBuildWatchDrawCards extends ModifierMyBuildWatch

  type:"ModifierMyBuildWatchDrawCards"
  @type:"ModifierMyBuildWatchDrawCards"

  drawAmount: 0

  @createContextObject: (drawAmount, options) ->
    contextObject = super(options)
    contextObject.drawAmount = drawAmount
    return contextObject

  onBuildWatch: (action) ->
    super()

    for i in [0...@drawAmount]
      @getGameSession().executeAction(new DrawCardAction(@getGameSession(), @getCard().getOwnerId()))

module.exports = ModifierMyBuildWatchDrawCards
