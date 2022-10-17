SpellDamage = require './spellDamage'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class SpellDamageEnemyGeneralBothDrawCard extends SpellDamage

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if general?
      # apply spell on enemy General
      applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    # enemy draws a card
    deck = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId()).getDeck()
    @getGameSession().executeAction(deck.actionDrawCard())

    # caster draws a card
    @getGameSession().executeAction(@getOwner().getDeck().actionDrawCard())

module.exports = SpellDamageEnemyGeneralBothDrawCard
