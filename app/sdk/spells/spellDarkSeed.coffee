Logger = require 'app/common/logger'
SpellDamage = require './spellDamage'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'

class SpellDarkSeed extends SpellDamage

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # deal 1 damage for each card in opponent's hand
    opponent = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
    cardsInHand = opponent.getDeck().getNumCardsInHand()
    @damageAmount = cardsInHand
    super(board,x,y,sourceAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions


module.exports = SpellDarkSeed
