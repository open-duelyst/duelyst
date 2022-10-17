Logger = require 'app/common/logger'
SpellSpawnEntity =  require './spellSpawnEntity'
UtilsGameSession = require 'app/common/utils/utils_game_session'
RemoveRandomArtifactAction =  require 'app/sdk/actions/removeRandomArtifactAction'

class SpellRashasCurseFollowup extends SpellSpawnEntity

  getValidTargetPositions: () ->
    if !@_private.cachedValidTargetPositions?
      @_private.cachedValidTargetPositions = @_filterPlayPositions(UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), @getFollowupSourcePosition(), @getFollowupSourcePattern()))
    return @_private.cachedValidTargetPositions

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "RemoveArtifactsAction::onApplyEffectToBoardTile"
    removeArtifactAction = new RemoveRandomArtifactAction(@getGameSession())
    removeArtifactAction.setTarget(board.getUnitAtPosition(@getFollowupSourcePosition()))
    @getGameSession().executeAction(removeArtifactAction)
    super(board,x,y,sourceAction) #and summon the Dervish

module.exports = SpellRashasCurseFollowup
