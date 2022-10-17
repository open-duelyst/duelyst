SpellKillTarget = require './spellKillTarget'
PlayCardAction = require 'app/sdk/actions/playCardAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellWrathOfGod extends SpellKillTarget

  _findApplyEffectPositions: (position, sourceAction) ->
    potentialApplyEffectPositions = super(position, sourceAction)
    applyEffectPositions = []
    board = @getGameSession().getBoard()

    for position in potentialApplyEffectPositions
      unit = board.getUnitAtPosition(position)
      if unit? and !unit.getIsGeneral()
        applyEffectPositions.push(position)

    return applyEffectPositions

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    applyEffectPosition = {x: x, y: y}
    unit = board.getUnitAtPosition(applyEffectPosition)
    if unit? and !unit.getIsGeneral()
      action = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, {id: Cards.Tile.Hallowed})
      action.setOwnerId(@getOwnerId())
      @getGameSession().executeAction(action)
    
    super(board,x,y,sourceAction)

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellWrathOfGod