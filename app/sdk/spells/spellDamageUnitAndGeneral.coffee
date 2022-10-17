SpellDamage = require './spellDamage'


class SpellDamageUnitAndGeneral extends SpellDamage

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = super(position, sourceAction)
    general = @getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId()).getPlayerId())
    applyEffectPositions.push(general.getPosition())
    return applyEffectPositions

module.exports = SpellDamageUnitAndGeneral
