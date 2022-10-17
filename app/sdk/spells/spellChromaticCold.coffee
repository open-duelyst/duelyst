SpellSilence = require './spellSilence'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellChromaticCold extends SpellSilence

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.targetsSpace = true # does not target any unit directly
    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # dispel the space

    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    if unit? and unit.getOwnerId() != @getOwnerId() # damage enemies on this space
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getOwnerId())
      damageAction.setTarget(unit)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)


module.exports = SpellChromaticCold
