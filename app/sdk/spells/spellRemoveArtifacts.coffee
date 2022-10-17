Logger = require 'app/common/logger'
Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
RemoveArtifactsAction =  require 'app/sdk/actions/removeArtifactsAction'

class SpellRemoveArtifacts extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyIndirect
  canTargetGeneral: true

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "RemoveArtifactsAction::onApplyEffectToBoardTile"
    removeArtifactsAction = new RemoveArtifactsAction(@getGameSession())
    removeArtifactsAction.setTarget(target)
    @getGameSession().executeAction(removeArtifactsAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if general? then applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellRemoveArtifacts
