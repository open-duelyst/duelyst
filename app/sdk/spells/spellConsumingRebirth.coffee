SpellKillTarget =   require './spellKillTarget'
Modifier = require 'app/sdk/modifiers/modifier'
PlayerModifierEndTurnRespawnEntityWithBuff = require 'app/sdk/playerModifiers/playerModifierEndTurnRespawnEntityWithBuff'

class SpellConsumingRebirth extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # get the target
    target = board.getCardAtPosition({x:x, y:y}, @targetType)

    # kill the target
    super(board, x, y, sourceAction)

    # apply respawn and buff modifier to target's general
    if target?
      myGeneral = @getGameSession().getGeneralForPlayerId(target.getOwnerId())
      if myGeneral?
        buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
        buffContextObject.appliedName = "Consumed and Reborn"
        respawnContextObject = PlayerModifierEndTurnRespawnEntityWithBuff.createContextObject(target.createNewCardData(), [buffContextObject], target.getPosition())
        @getGameSession().applyModifierContextObject(respawnContextObject, myGeneral)

module.exports = SpellConsumingRebirth
