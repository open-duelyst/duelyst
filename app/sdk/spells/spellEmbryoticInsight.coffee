Spell =  require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellEmbryoticInsight extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    player = @getGameSession().getPlayerById(@getOwnerId())

    for unit in @getGameSession().getBoard().getUnits()
      if unit.getOwnerId() is @getOwnerId() and !unit.getIsGeneral() and unit.getBaseCardId() is Cards.Faction5.Egg
        drawAction1 = player.getDeck().actionDrawCard()
        @getGameSession().executeAction(drawAction1)
        drawAction2 = player.getDeck().actionDrawCard()
        @getGameSession().executeAction(drawAction2)
        break

module.exports = SpellEmbryoticInsight
