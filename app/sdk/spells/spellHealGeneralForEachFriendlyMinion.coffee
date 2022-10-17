SpellHealYourGeneral = require('./spellHealYourGeneral')

class SpellHealGeneralForEachFriendlyMinion extends SpellHealYourGeneral

  healModifier: 0
  healAmountPerMinion: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    for unit in board.getUnits(true, false)
      if unit?.getOwnerId() == @getOwnerId() and !unit.getIsGeneral()
        this.healModifier += @healAmountPerMinion

    super(board,x,y,sourceAction)

module.exports = SpellHealGeneralForEachFriendlyMinion