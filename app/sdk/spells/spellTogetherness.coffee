Spell =  require './spell'
CardType = require 'app/sdk/cards/cardType'

class SpellTogetherness extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    unitsNearby = board.getEntitiesAroundEntity(general, CardType.Unit, 1, true, false)
    player = @getGameSession().getPlayerById(@getOwnerId())

    for unit in unitsNearby
      if unit? and !unit.getIsGeneral() and unit.getOwnerId() is @getOwnerId()
        action = player.getDeck().actionDrawCard()
        @getGameSession().executeAction(action)

module.exports = SpellTogetherness