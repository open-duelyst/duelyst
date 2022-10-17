SpellRemoveAndReplaceEntity = require './spellRemoveAndReplaceEntity'
KillAction = require 'app/sdk/actions/killAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellHugToDeath extends SpellRemoveAndReplaceEntity

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    targetEntity = board.getUnitAtPosition({x: x, y: y})
    if targetEntity?
      if targetEntity.getBaseCardId() is Cards.Faction2.OnyxBear
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getOwnerId())
        killAction.setTarget(targetEntity)
        @getGameSession().executeAction(killAction)

        player = @getGameSession().getPlayerById(@getOwnerId())
        for action in player.getDeck().actionsDrawCardsToRefillHand()
          @getGameSession().executeAction(action)
      else
        @cardDataOrIndexToSpawn = {id: Cards.Faction2.OnyxBear}
        super(board,x,y,sourceAction)

module.exports = SpellHugToDeath
