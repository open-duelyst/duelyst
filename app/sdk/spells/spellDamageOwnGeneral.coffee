SpellDamage = require './spellDamage'

class SpellDamageOwnGeneral extends SpellDamage

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if general?
      # apply spell on enemy General
      applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellDamageOwnGeneral
