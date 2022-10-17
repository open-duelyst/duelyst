SpellRefreshExhaustion = require './spellRefreshExhaustion'
ModifierCannotAttackGeneral = require 'app/sdk/modifiers/modifierCannotAttackGeneral'
ModifierCannotDamageGenerals = require 'app/sdk/modifiers/modifierCannotDamageGenerals'

class SpellAssassinationProtocol extends SpellRefreshExhaustion

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    if unit?
      cantAttackGeneralModifier = ModifierCannotAttackGeneral.createContextObject()
      cantAttackGeneralModifier.durationEndTurn = 1
      cantAttackGeneralModifier.isRemovable = false
      @getGameSession().applyModifierContextObject(cantAttackGeneralModifier, unit)

      cantDamageGeneralModifier = ModifierCannotDamageGenerals.createContextObject()
      cantDamageGeneralModifier.durationEndTurn = 1
      cantDamageGeneralModifier.isRemovable = false
      @getGameSession().applyModifierContextObject(cantDamageGeneralModifier, unit)

module.exports = SpellAssassinationProtocol
