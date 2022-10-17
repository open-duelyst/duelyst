Logger = require 'app/common/logger'
SpellDamage = require('./spellDamage')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellDamageMinionAndGeneral extends SpellDamage

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  damageAmount: 0

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = super(position, sourceAction)

    # can only target enemy general
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellDamageMinionAndGeneral
