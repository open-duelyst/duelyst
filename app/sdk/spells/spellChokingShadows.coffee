Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

CONFIG = require 'app/common/config'

class SpellChokingShadows extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None
  cardDataOrIndexToSpawn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "ChokingShadows::onApplyEffectToBoardTile"
    applyEffectPosition = {x: x, y: y}

    # always spawn a shadow tile at each position
    if board.isOnBoard(applyEffectPosition)
      action = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, @cardDataOrIndexToSpawn)
      action.setOwnerId(@getOwnerId())
      @getGameSession().executeAction(action)


module.exports = SpellChokingShadows
