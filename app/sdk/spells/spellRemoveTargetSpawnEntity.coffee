Logger = require 'app/common/logger'
SpellRemoveTarget = require('./spellRemoveTarget')
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellRemoveTargetSpawnEntity extends SpellRemoveTarget

  cardDataOrIndexToSpawn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @cardDataOrIndexToSpawn
      spawnEntityAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, @cardDataOrIndexToSpawn)
      @getGameSession().executeAction(spawnEntityAction)

module.exports = SpellRemoveTargetSpawnEntity