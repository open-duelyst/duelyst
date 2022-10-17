SpellSilence = require './spellSilence'
Modifier = require 'app/sdk/modifiers/modifier'

class SpellToothAndTrial extends SpellSilence

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.targetsSpace = true # does not target any unit directly
    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # dispel the space

    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    if unit? and !unit.getIsGeneral()
      modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      modifierContextObject.appliedName = "Primitive Strength"
      @getGameSession().applyModifierContextObject(modifierContextObject, unit)

module.exports = SpellToothAndTrial
