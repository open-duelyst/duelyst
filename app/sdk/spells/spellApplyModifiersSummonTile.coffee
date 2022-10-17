SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class SpellApplyModifiersSummonTile extends SpellApplyModifiers

  cardDataOrIndexToSpawn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}

    # always spawn a tile at position
    if board.isOnBoard(applyEffectPosition)
      action = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, @cardDataOrIndexToSpawn)
      action.setOwnerId(@getOwnerId())
      @getGameSession().executeAction(action)


module.exports = SpellApplyModifiersSummonTile