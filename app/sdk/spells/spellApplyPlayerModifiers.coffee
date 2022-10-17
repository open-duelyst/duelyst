SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'

class SpellApplyPlayerModifiers extends SpellApplyModifiers

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  applyToOwnGeneral: false
  applyToOpponentGeneral: false

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.targetsSpace = true # does not target any unit directly
    return p

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    if @targetModifiersContextObjects? and @targetModifiersContextObjects.length > 0
      ownerId = @getOwnerId()

      if @applyToOwnGeneral
        # target own General
        ownGeneral = @getGameSession().getGeneralForPlayerId(ownerId)
        applyEffectPositions.push(ownGeneral.getPosition())

      if @applyToOpponentGeneral
        # target opponent's General
        opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(ownerId)
        applyEffectPositions.push(opponentGeneral.getPosition())

    return applyEffectPositions

module.exports = SpellApplyPlayerModifiers
