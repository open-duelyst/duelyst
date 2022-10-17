Logger = require 'app/common/logger'
SpellHeal = require('./spellHeal')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellHealYourGeneral extends SpellHeal

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None
  healModifier: 0

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellHealYourGeneral
