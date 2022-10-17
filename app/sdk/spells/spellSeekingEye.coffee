CONFIG = require 'app/common/config'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'

class SpellOverload extends Spell

  spellFilterType: SpellFilterType.NeutralIndirect

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # draw card for caster
    player = @getGameSession().getPlayerById(@getOwnerId())
    action = player.getDeck().actionDrawCard()
    @getGameSession().executeAction(action)

    # draw card for opponent of caster
    player = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
    action = player.getDeck().actionDrawCard()
    @getGameSession().executeAction(action)

module.exports = SpellOverload
