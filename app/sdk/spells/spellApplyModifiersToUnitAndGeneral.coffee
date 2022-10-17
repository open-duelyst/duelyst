SpellApplyModifiers = require './spellApplyModifiers'

class SpellApplyModifiersToUnitAndGeneral extends SpellApplyModifiers

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = super(position, sourceAction)

    # also affects General
    applyEffectPositions.push(@getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition())

    return applyEffectPositions

module.exports = SpellApplyModifiersToUnitAndGeneral
