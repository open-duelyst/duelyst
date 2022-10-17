Logger = require 'app/common/logger'
SpellKillTarget = require('./spellKillTarget')
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellKillTargetSpawnEntity extends SpellKillTarget

  cardDataOrIndexToSpawn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @cardDataOrIndexToSpawn
      spawnEntityAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, @cardDataOrIndexToSpawn)
      @getGameSession().executeAction(spawnEntityAction)

module.exports = SpellKillTargetSpawnEntity
