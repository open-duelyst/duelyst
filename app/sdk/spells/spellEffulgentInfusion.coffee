SpellApplyModifiers = require './spellApplyModifiers'
Modifier = require 'app/sdk/modifiers/modifier'

class SpellEffulgentInfusion extends SpellApplyModifiers

  appliedName: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if general?
      attack = general.getATK()
      if attack > 0
        atkBuff = Modifier.createContextObjectWithAttributeBuffs(attack,0)
        atkBuff.appliedName = @appliedName
        @targetModifiersContextObjects = [atkBuff]
        super(board, x, y, sourceAction)

module.exports = SpellEffulgentInfusion
