SpellDamage = require './spellDamage'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
_ = require 'underscore'

class SpellDamageAndPutCardInHand extends SpellDamage

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    applyEffectPosition = {x: x, y: y}

    a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

    super(board,x,y,sourceAction)

module.exports = SpellDamageAndPutCardInHand
