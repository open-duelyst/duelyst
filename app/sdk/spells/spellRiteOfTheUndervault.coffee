CONFIG = require 'app/common/config'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'

class SpellRiteOfTheUndervault extends Spell

  spellFilterType: SpellFilterType.NeutralIndirect

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # draw to fill hand for player who just cast this spell
    player = @getGameSession().getPlayerById(@getOwnerId())
    for action in player.getDeck().actionsDrawCardsToRefillHand()
      @getGameSession().executeAction(action)

module.exports = SpellRiteOfTheUndervault
