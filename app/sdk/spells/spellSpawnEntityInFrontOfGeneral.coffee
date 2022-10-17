SpellSpawnEntity = require './spellSpawnEntity'
CardType = require './../cards/cardType.coffee'

class SpellSpawnEntityInFrontOfGeneral extends SpellSpawnEntity

  targetType: CardType.Unit
  spawnSilently: true

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    applyEffectPositions = []
    if general?
      playerOffset = 0
      if @isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
      frontPosition = {x:general.getPosition().x+playerOffset, y:general.getPosition().y}
      if @getGameSession().getBoard().isOnBoard(frontPosition)
        applyEffectPositions = [frontPosition]

    return applyEffectPositions

  _postFilterPlayPositions: (validPositions) ->
    return validPositions


module.exports = SpellSpawnEntityInFrontOfGeneral
