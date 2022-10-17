SpellApplyModifiers =  require './spellApplyModifiers.coffee'
CardType = require 'app/sdk/cards/cardType.coffee'
SpellFilterType = require './spellFilterType.coffee'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction.coffee'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction.coffee'

class SpellPsychicConduit extends SpellApplyModifiers

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect

  maxAttack: -1

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    a = new SwapUnitAllegianceAction(@getGameSession())
    a.setTarget(entity)
    @getGameSession().executeAction(a)

    # activate immediately
    refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
    refreshExhaustionAction.setTarget(entity)
    @getGameSession().executeAction(refreshExhaustionAction)

  _postFilterPlayPositions: (validPositions) ->
    validTargetPositions = []

    if @maxAttack >= 0 # if maxAttack < 0, then any enemy unit is a valid target
      for position in validPositions
        unit = @getGameSession().getBoard().getUnitAtPosition(position)
        if unit? and unit.getATK() <= @maxAttack
          validTargetPositions.push(position)

    return validTargetPositions

module.exports = SpellPsychicConduit
