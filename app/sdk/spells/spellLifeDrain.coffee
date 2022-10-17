SpellKillTarget = require './spellKillTarget.coffee'
HealAction = require 'app/sdk/actions/healAction'
UtilsPosition = require 'app/common/utils/utils_position'

class SpellLifeDrain extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    entity = board.getCardAtPosition({x:x, y:y}, @targetType)

    # kill target
    if !entity.isGeneral
      super(board,x,y,sourceAction)

    # heal your general
    else
      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getOwnerId())
      healAction.setTarget(general)
      healAction.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = super(position, sourceAction)

    # add your the General's position in as well
    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    generalPosition = general.getPosition()
    if !UtilsPosition.getIsPositionInPositions(applyEffectPositions, generalPosition)
      applyEffectPositions.push(generalPosition)

    return applyEffectPositions

module.exports = SpellLifeDrain
