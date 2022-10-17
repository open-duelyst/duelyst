Spell = require './spell'
RestoreManaAction =  require 'app/sdk/actions/restoreManaAction'

class SpellRestoreMana extends Spell

  restoreManaAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    restoreManaAction = new RestoreManaAction(@getGameSession())
    restoreManaAction.setManaAmount(@restoreManaAmount)
    @getGameSession().executeAction(restoreManaAction)

module.exports = SpellRestoreMana
